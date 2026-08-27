import 'server-only';

import { Resend } from 'resend';
import { SITE_URL } from '@/lib/site';
import { getInquiryTypeLabel } from './constants';
import type { ContactSubmissionData, SubmissionSource } from './types';

const ADMIN_TO = 'info@arigatosun.com';
const FROM_ADDRESS = '株式会社アリガトサン <noreply@arigatosun.com>';
const COMPANY_NAME = '株式会社アリガトサン';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function contactTable(data: ContactSubmissionData): string {
  const rows = [
    ['お問い合わせ種別', getInquiryTypeLabel(data.inquiryType)],
    ['御社名・部署名', data.company || '未入力'],
    ['お名前', data.name],
    ['ヨミガナ', data.nameKana || '未入力'],
    ['メールアドレス', data.email],
    ['電話番号', data.phone || '未入力'],
    ['お問い合わせ内容', data.message],
  ];
  return `<table style="border-collapse:collapse;width:100%;max-width:600px">${rows
    .map(([label, value]) => `<tr><th style="padding:8px 16px;border:1px solid #ddd;background:#f5f5f5;text-align:left">${escapeHtml(label)}</th><td style="padding:8px 16px;border:1px solid #ddd;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`)
    .join('')}</table>`;
}

export async function sendContactEmails(
  data: ContactSubmissionData,
  source: SubmissionSource,
): Promise<{ autoReplySent: boolean }> {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const table = contactTable(data);
  const sourceLabel = source === 'webmcp'
    ? 'WebMCP（本人承認済み）'
    : source === 'legacy_manual'
      ? 'Webフォーム（旧画面互換受付）'
      : 'Webフォーム';
  const admin = await resend.emails.send({
    from: FROM_ADDRESS,
    to: [ADMIN_TO],
    replyTo: data.email,
    subject: `【お問い合わせ】${data.name}様より`,
    html: `<h2>お問い合わせがありました</h2>${table}<p>受付経路: ${sourceLabel}</p>`,
  });
  if (admin.error) {
    console.error('[contact] admin notification failed');
    throw new Error('Admin notification failed');
  }

  try {
    const reply = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [data.email],
      replyTo: ADMIN_TO,
      subject: `【受付完了】お問い合わせを承りました - ${COMPANY_NAME}`,
      html: `<p>${escapeHtml(data.name)} 様</p><p>お問い合わせを承りました。担当者より2〜3営業日以内にご返信します。</p>${table}<p><a href="${SITE_URL}">${SITE_URL}</a></p>`,
    });
    if (reply.error) {
      console.warn('[contact] auto reply failed');
      return { autoReplySent: false };
    }
    return { autoReplySent: true };
  } catch {
    console.warn('[contact] auto reply failed');
    return { autoReplySent: false };
  }
}
