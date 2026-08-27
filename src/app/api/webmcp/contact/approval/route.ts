import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { hashContact, hashIdempotencyKey } from '@/lib/contact/canonicalize';
import { canAutoSubmitInquiry, PRIVACY_POLICY_VERSION } from '@/lib/contact/constants';
import { normalizeIdempotencyKey } from '@/lib/contact/idempotency';
import { parseContactForm, validateContact } from '@/lib/contact/validation';
import { HttpInputError, readJsonObject } from '@/lib/http/read-json';
import { SITE_URL } from '@/lib/site';
import { createApprovalToken } from '@/lib/webmcp/approval-token';
import { writeWebMcpAudit } from '@/lib/webmcp/audit';
import { createWebMcpAdminClient } from '@/lib/webmcp/db';
import {
  hashClientIp,
  hashSessionId,
  isValidWebMcpMutationRequest,
  requestId,
} from '@/lib/webmcp/request';
import { getWebMcpRuntimeConfig } from '@/lib/webmcp/runtime-config';

const NO_STORE = { 'Cache-Control': 'private, no-store, max-age=0' };

function json(body: object, init?: ResponseInit) {
  return NextResponse.json(body, { ...init, headers: { ...NO_STORE, ...init?.headers } });
}

export async function POST(request: Request) {
  const auditRequestId = requestId(request);
  if (!isValidWebMcpMutationRequest(request)) {
    await writeWebMcpAudit({ requestId: auditRequestId, event: 'approval_rejected', result: 'ORIGIN_REJECTED' });
    return json({ error: '送信元を確認できません。' }, { status: 403 });
  }

  try {
    const config = await getWebMcpRuntimeConfig();
    if (!config.prepareContactEnabled || !config.submitContactEnabled) {
      await writeWebMcpAudit({ requestId: auditRequestId, event: 'approval_rejected', result: 'RUNTIME_DISABLED' });
      return json({
        error: '自動送信は現在利用できません。通常のお問い合わせフォームをご利用ください。',
        manualRequired: true,
        contactUrl: `${SITE_URL}/contact`,
      }, { status: 503 });
    }

    const body = await readJsonObject(request);
    const contact = parseContactForm(body.contact);
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
    const rawIdempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey : '';
    const idempotencyKey = rawIdempotencyKey ? normalizeIdempotencyKey(rawIdempotencyKey) : null;
    if (
      !contact || !sessionId || !idempotencyKey ||
      body.userConfirmed !== true ||
      body.privacyConsent !== true ||
      body.privacyPolicyVersion !== PRIVACY_POLICY_VERSION ||
      Object.keys(validateContact(contact)).length > 0
    ) {
      return json({ error: '画面上で内容とプライバシーポリシーへの同意を確認してください。' }, { status: 400 });
    }
    if (!canAutoSubmitInquiry(contact.inquiryType)) {
      await writeWebMcpAudit({
        requestId: auditRequestId,
        event: 'approval_rejected',
        result: 'TYPE_NOT_ALLOWED',
        inquiryType: contact.inquiryType,
      });
      return json({
        error: 'このお問い合わせ種別は自動送信できません。通常のフォームから送信してください。',
        manualRequired: true,
        contactUrl: `${SITE_URL}/contact`,
      }, { status: 403 });
    }

    // WebMCP auto-submit is fail-closed: missing security configuration or DB errors stop approval.
    const ipHash = hashClientIp(request);
    const sessionHash = hashSessionId(sessionId);
    const payloadHash = hashContact(contact);
    const idempotencyKeyHash = hashIdempotencyKey(idempotencyKey);
    const supabase = createWebMcpAdminClient();
    const { data: allowed, error: gateError } = await supabase.rpc('webmcp_contact_gate', {
      p_ip_hash: ipHash,
      p_limit: 5,
      p_window_seconds: 600,
    });
    if (gateError) throw gateError;
    if (allowed !== true) {
      await writeWebMcpAudit({
        requestId: auditRequestId,
        event: 'approval_rejected',
        result: 'RATE_LIMITED',
        inquiryType: contact.inquiryType,
        payloadHash,
        sessionHash,
      });
      return json({ error: '送信回数が多すぎます。しばらく待ってからお試しください。' }, { status: 429 });
    }

    const ttl = Math.min(900, Math.max(60, Number(process.env.WEBMCP_APPROVAL_TTL_SECONDS) || 600));
    const expiresAt = Date.now() + ttl * 1000;
    const approvalId = randomUUID();
    const consentedAt = new Date().toISOString();
    const { error } = await supabase.from('webmcp_contact_approvals').insert({
      id: approvalId,
      payload_hash: payloadHash,
      session_hash: sessionHash,
      ip_hash: ipHash,
      idempotency_key_hash: idempotencyKeyHash,
      inquiry_type: contact.inquiryType,
      privacy_policy_version: PRIVACY_POLICY_VERSION,
      privacy_consented_at: consentedAt,
      expires_at: new Date(expiresAt).toISOString(),
    });
    if (error) throw error;

    await writeWebMcpAudit({
      requestId: auditRequestId,
      event: 'approval_created',
      toolName: 'submit_project_request',
      result: 'APPROVAL_CREATED',
      inquiryType: contact.inquiryType,
      payloadHash,
      sessionHash,
    });
    return json({
      approvalToken: createApprovalToken({ approvalId, payloadHash, sessionHash, idempotencyKeyHash, expiresAt }),
      expiresAt: new Date(expiresAt).toISOString(),
    });
  } catch (error) {
    if (error instanceof HttpInputError) {
      return json({ error: error.message, code: error.code }, { status: error.status });
    }
    const errorCode = error instanceof Error ? error.name : 'DB_ERROR';
    await writeWebMcpAudit({ requestId: auditRequestId, event: 'approval_failed', result: 'DB_ERROR', errorCode });
    console.error(`[webmcp] approval creation failed: ${errorCode}`);
    return json({
      error: '自動送信の承認処理を利用できません。通常のお問い合わせフォームをご利用ください。',
      manualRequired: true,
      contactUrl: `${SITE_URL}/contact`,
    }, { status: 503 });
  }
}
