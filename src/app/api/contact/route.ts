import { NextResponse } from 'next/server';
import { hashContact } from '@/lib/contact/canonicalize';
import { PRIVACY_POLICY_VERSION } from '@/lib/contact/constants';
import { sendContactEmails } from '@/lib/contact/email';
import {
  claimManualSubmission,
  completeManualSubmission,
  normalizeIdempotencyKey,
} from '@/lib/contact/idempotency';
import { parseLegacyContact } from '@/lib/contact/legacy';
import { checkManualContactRate } from '@/lib/contact/rate-limit';
import type { ContactSubmissionData, SubmissionSource } from '@/lib/contact/types';
import { parseManualContactForm, validateSubmissionContact } from '@/lib/contact/validation';
import { HttpInputError, readJsonObject } from '@/lib/http/read-json';
import { writeWebMcpAudit } from '@/lib/webmcp/audit';
import { isValidManualMutationRequest } from '@/lib/webmcp/request';

const MIN_SUBMIT_MS = 2000;
const NO_STORE = { 'Cache-Control': 'private, no-store, max-age=0' };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  if (!isValidManualMutationRequest(request)) {
    await writeWebMcpAudit({ event: 'manual_origin_rejected', result: 'ORIGIN_REJECTED' });
    return json({ error: 'リクエスト元を確認できませんでした。' }, 403);
  }

  try {
    const body = await readJsonObject(request);
    if ((typeof body.website === 'string' && body.website.trim()) ||
        (typeof body._t === 'number' && Date.now() - body._t < MIN_SUBMIT_MS)) {
      return json({ success: true });
    }

    let contact: ContactSubmissionData;
    let source: Extract<SubmissionSource, 'manual_form' | 'legacy_manual'>;
    let privacyPolicyVersion: string;
    let privacyConsentedAt: string;

    // 種別UIはサイト上に表示しない方針のため、通常フォームは種別なしのpayloadが正規形。
    const current = 'privacyConsent' in body ? parseManualContactForm(body) : null;
    if (current) {
      if (body.privacyConsent !== true || body.privacyPolicyVersion !== PRIVACY_POLICY_VERSION) {
        return json({ error: 'プライバシーポリシーへの同意が必要です。' }, 400);
      }
      contact = current;
      source = 'manual_form';
      privacyPolicyVersion = PRIVACY_POLICY_VERSION;
      privacyConsentedAt = new Date().toISOString();
    } else {
      const legacy = parseLegacyContact(body);
      if (!legacy) return json({ error: '入力内容を確認してください。ページを再読み込みすると解消する場合があります。' }, 400);
      contact = legacy.contact;
      source = 'legacy_manual';
      privacyPolicyVersion = legacy.privacyPolicyVersion;
      privacyConsentedAt = legacy.privacyConsentedAt;
      await writeWebMcpAudit({ event: 'legacy_contact_accepted', result: 'LEGACY_CONTACT_ACCEPTED' });
    }

    if (Object.keys(validateSubmissionContact(contact)).length > 0) {
      return json({ error: '入力内容を確認してください。' }, 400);
    }

    const idempotencyKey = normalizeIdempotencyKey(request.headers.get('idempotency-key'));
    if (!idempotencyKey) return json({ error: '送信識別子が不正です。' }, 400);
    if (!(await checkManualContactRate(request))) {
      return json({ error: '送信回数が多すぎます。時間をおいて再度お試しください。' }, 429);
    }

    const payloadHash = hashContact(contact);
    const claim = await claimManualSubmission({
      idempotencyKey,
      payloadHash,
      source,
      privacyPolicyVersion,
      privacyConsentedAt,
    });
    if (claim.status === 'duplicate_sent') {
      return json({ success: true, duplicate: true, receiptId: claim.publicReceiptId });
    }
    if (claim.status === 'duplicate_pending') {
      return json({ error: '同じ送信処理が未完了です。時間をおいて再度お試しください。' }, 409);
    }
    if (claim.status === 'conflict') {
      return json({ error: '同じ送信識別子が別の内容で使用されています。ページを再読み込みしてください。' }, 409);
    }

    try {
      const { autoReplySent } = await sendContactEmails(contact, source);
      await completeManualSubmission(claim, 'sent');
      if (!autoReplySent) {
        await writeWebMcpAudit({ event: 'manual_auto_reply_failed', result: 'AUTO_REPLY_FAILED', payloadHash });
      }
      return json({ success: true, receiptId: claim.publicReceiptId });
    } catch (error) {
      await completeManualSubmission(claim, 'failed');
      await writeWebMcpAudit({
        event: 'manual_email_failed', result: 'EMAIL_ERROR', payloadHash,
        errorCode: error instanceof Error ? error.name : 'EMAIL_ERROR',
      });
      throw error;
    }
  } catch (error) {
    if (error instanceof HttpInputError) return json({ error: error.message, code: error.code }, error.status);
    console.error(`[contact] request failed: ${error instanceof Error ? error.name : 'UNKNOWN_ERROR'}`);
    return json({ error: 'メールの送信に失敗しました。' }, 500);
  }
}
