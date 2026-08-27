import { NextResponse } from 'next/server';
import { hashContact, hashIdempotencyKey } from '@/lib/contact/canonicalize';
import { canAutoSubmitInquiry, PRIVACY_POLICY_VERSION } from '@/lib/contact/constants';
import { sendContactEmails } from '@/lib/contact/email';
import { normalizeIdempotencyKey } from '@/lib/contact/idempotency';
import { parseContactForm, validateContact } from '@/lib/contact/validation';
import { HttpInputError, readJsonObject } from '@/lib/http/read-json';
import { SITE_URL } from '@/lib/site';
import { inspectApprovalToken } from '@/lib/webmcp/approval-token';
import { writeWebMcpAudit } from '@/lib/webmcp/audit';
import { createWebMcpAdminClient } from '@/lib/webmcp/db';
import { hashSessionId, isValidWebMcpMutationRequest, requestId } from '@/lib/webmcp/request';
import { getWebMcpRuntimeConfig } from '@/lib/webmcp/runtime-config';

const NO_STORE = { 'Cache-Control': 'private, no-store, max-age=0' };

function json(body: object, init?: ResponseInit) {
  return NextResponse.json(body, { ...init, headers: { ...NO_STORE, ...init?.headers } });
}

export async function POST(request: Request) {
  const auditRequestId = requestId(request);
  if (!isValidWebMcpMutationRequest(request)) {
    await writeWebMcpAudit({ requestId: auditRequestId, event: 'submission_rejected', result: 'ORIGIN_REJECTED' });
    return json({ error: '送信元を確認できません。' }, { status: 403 });
  }

  try {
    const config = await getWebMcpRuntimeConfig();
    if (!config.submitContactEnabled) {
      await writeWebMcpAudit({ requestId: auditRequestId, event: 'submission_rejected', result: 'RUNTIME_DISABLED' });
      return json({ error: '自動送信は現在利用できません。通常のお問い合わせフォームをご利用ください。', manualRequired: true, contactUrl: `${SITE_URL}/contact` }, { status: 503 });
    }

    const body = await readJsonObject(request);
    const contact = parseContactForm(body.contact);
    const token = typeof body.approvalToken === 'string' ? body.approvalToken : '';
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
    const rawIdempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey : '';
    const idempotencyKey = rawIdempotencyKey ? normalizeIdempotencyKey(rawIdempotencyKey) : null;
    if (
      !contact || !token || !sessionId || !idempotencyKey ||
      body.privacyConsent !== true ||
      body.privacyPolicyVersion !== PRIVACY_POLICY_VERSION ||
      Object.keys(validateContact(contact)).length > 0
    ) return json({ error: '送信内容が不正です。' }, { status: 400 });

    if (!canAutoSubmitInquiry(contact.inquiryType)) {
      await writeWebMcpAudit({ requestId: auditRequestId, event: 'submission_rejected', result: 'TYPE_NOT_ALLOWED', inquiryType: contact.inquiryType });
      return json({ error: 'このお問い合わせ種別は自動送信できません。' }, { status: 403 });
    }

    const verification = inspectApprovalToken(token);
    if (!verification.ok) {
      const result = verification.reason === 'expired' ? 'EXPIRED_TOKEN' : 'INVALID_TOKEN';
      await writeWebMcpAudit({ requestId: auditRequestId, event: 'submission_rejected', result });
      return json({ error: '承認が無効か、有効期限が切れています。もう一度内容を確認してください。' }, { status: 409 });
    }

    const payloadHash = hashContact(contact);
    const sessionHash = hashSessionId(sessionId);
    const idempotencyKeyHash = hashIdempotencyKey(idempotencyKey);
    const claims = verification.claims;
    if (claims.payloadHash !== payloadHash) {
      await writeWebMcpAudit({ requestId: auditRequestId, event: 'submission_rejected', result: 'PAYLOAD_MISMATCH', inquiryType: contact.inquiryType, payloadHash, sessionHash });
      return json({ error: '確認後に内容が変更されました。もう一度確認してください。' }, { status: 409 });
    }
    if (claims.sessionHash !== sessionHash) {
      await writeWebMcpAudit({ requestId: auditRequestId, event: 'submission_rejected', result: 'SESSION_MISMATCH', inquiryType: contact.inquiryType, payloadHash, sessionHash });
      return json({ error: '承認したブラウザーセッションと一致しません。' }, { status: 409 });
    }
    if (claims.idempotencyKeyHash !== idempotencyKeyHash) {
      await writeWebMcpAudit({ requestId: auditRequestId, event: 'submission_rejected', result: 'IDEMPOTENCY_MISMATCH', inquiryType: contact.inquiryType, payloadHash, sessionHash });
      return json({ error: '送信識別子が承認時と一致しません。' }, { status: 409 });
    }

    const supabase = createWebMcpAdminClient();
    const { data, error: claimError } = await supabase.rpc('webmcp_claim_contact_submission', {
      p_approval_id: claims.approvalId,
      p_payload_hash: payloadHash,
      p_session_hash: sessionHash,
      p_idempotency_key: idempotencyKey,
      p_idempotency_key_hash: idempotencyKeyHash,
    });
    if (claimError) throw claimError;
    const claim = data as { result?: string; public_receipt_id?: string } | null;
    if (!claim?.result || !claim.public_receipt_id) {
      await writeWebMcpAudit({ requestId: auditRequestId, event: 'submission_rejected', result: 'APPROVAL_CONSUMED', inquiryType: contact.inquiryType, payloadHash, sessionHash });
      return json({ error: '承認は使用済みか無効です。もう一度内容を確認してください。' }, { status: 409 });
    }
    if (claim.result === 'sent') return json({ success: true, duplicate: true, receiptId: claim.public_receipt_id });
    if (claim.result !== 'claimed') {
      const message = claim.result === 'failed'
        ? '前回の送信処理に失敗しています。通常のフォームからお問い合わせください。'
        : '同じ送信処理が進行中です。しばらく待ってからご確認ください。';
      return json({ error: message, receiptId: claim.public_receipt_id }, { status: 409 });
    }

    try {
      const mailResult = await sendContactEmails(contact, 'webmcp');
      const { error: receiptError } = await supabase
        .from('contact_submission_receipts')
        .update({ status: 'sent', completed_at: new Date().toISOString() })
        .eq('idempotency_key', idempotencyKey);
      if (receiptError) {
        console.warn(`[webmcp] receipt update failed after admin notification: ${receiptError.code || 'DB_ERROR'}`);
        await writeWebMcpAudit({ requestId: auditRequestId, event: 'receipt_update_failed_after_send', result: 'DB_ERROR', inquiryType: contact.inquiryType, payloadHash, sessionHash, errorCode: receiptError.code });
      }
      if (!mailResult.autoReplySent) {
        await writeWebMcpAudit({ requestId: auditRequestId, event: 'auto_reply_failed', result: 'AUTO_REPLY_FAILED', inquiryType: contact.inquiryType, payloadHash, sessionHash });
      }
      await writeWebMcpAudit({ requestId: auditRequestId, event: 'contact_submitted', toolName: 'submit_project_request', result: 'CONTACT_SENT', inquiryType: contact.inquiryType, payloadHash, sessionHash });
      return json({ success: true, receiptId: claim.public_receipt_id, autoReplySent: mailResult.autoReplySent });
    } catch (mailError) {
      const errorCode = mailError instanceof Error ? mailError.name : 'EMAIL_ERROR';
      const { error: receiptError } = await supabase
        .from('contact_submission_receipts')
        .update({ status: 'failed', completed_at: new Date().toISOString() })
        .eq('idempotency_key', idempotencyKey);
      if (receiptError) console.warn(`[webmcp] failed receipt update failed: ${receiptError.code || 'DB_ERROR'}`);
      await writeWebMcpAudit({ requestId: auditRequestId, event: 'contact_submission_failed', result: 'EMAIL_ERROR', inquiryType: contact.inquiryType, payloadHash, sessionHash, errorCode });
      return json({ error: '送信に失敗しました。通常のお問い合わせフォームをご利用ください。', manualRequired: true, contactUrl: `${SITE_URL}/contact`, receiptId: claim.public_receipt_id }, { status: 502 });
    }
  } catch (error) {
    if (error instanceof HttpInputError) return json({ error: error.message, code: error.code }, { status: error.status });
    const errorCode = error instanceof Error ? error.name : 'DB_ERROR';
    await writeWebMcpAudit({ requestId: auditRequestId, event: 'submission_failed', result: 'DB_ERROR', errorCode });
    console.error(`[webmcp] contact submission failed: ${errorCode}`);
    return json({ error: '自動送信処理を利用できません。通常のお問い合わせフォームをご利用ください。', manualRequired: true, contactUrl: `${SITE_URL}/contact` }, { status: 503 });
  }
}
