import { NextResponse } from 'next/server';
import { Resend } from 'resend';

interface ContactFormData {
  company: string;
  name: string;
  nameKana: string;
  email: string;
  phone: string;
  message: string;
}

const ADMIN_TO = 'info@arigatosun.com';
const FROM_ADDRESS = '合同会社アリガトサン <noreply@arigatosun.com>';
const COMPANY_NAME = '合同会社アリガトサン';
const COMPANY_URL = 'https://arigatosun.com';

/**
 * お問い合わせフォーム送信エンドポイント。
 *
 * 動作:
 *  1. 入力値のバリデーション（name / email / message が必須）
 *  2. Resend で 2 通並列送信:
 *     - 管理者宛通知メール ({@link ADMIN_TO})
 *     - 送信者宛 自動返信メール（受付確認）
 *  3. 管理者通知が失敗したら全体を 500 で返す。
 *     自動返信のみ失敗した場合はサーバーログに残し、ユーザーには success を返す
 *     （受付自体は成立しているため）。
 */
export async function POST(request: Request) {
  try {
    const body: ContactFormData = await request.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: '必須項目を入力してください。' },
        { status: 400 },
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'メール送信先が設定されていません。' },
        { status: 500 },
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const [adminResult, autoReplyResult] = await Promise.allSettled([
      sendAdminNotification(resend, body),
      sendAutoReply(resend, body),
    ]);

    // 管理者通知が失敗したら全体エラー扱い（受付が確定しないため）
    const adminOk =
      adminResult.status === 'fulfilled' && !adminResult.value.error;
    if (!adminOk) {
      console.error(
        '[contact] admin notification failed:',
        adminResult.status === 'rejected'
          ? adminResult.reason
          : adminResult.value.error,
      );
      return NextResponse.json(
        { error: 'メールの送信に失敗しました。' },
        { status: 500 },
      );
    }

    // 自動返信のみ失敗時はログ通知のみ。ユーザーには成功として返す
    if (
      autoReplyResult.status === 'rejected' ||
      autoReplyResult.value.error
    ) {
      console.warn(
        '[contact] auto-reply failed (admin notification still sent):',
        autoReplyResult.status === 'rejected'
          ? autoReplyResult.reason
          : autoReplyResult.value.error,
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 },
    );
  }
}

/** HTML メール本文に含める文字列を XSS 安全にエスケープする。 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 管理者宛: お問い合わせ受信通知メール。 */
async function sendAdminNotification(resend: Resend, body: ContactFormData) {
  const e = {
    company: escapeHtml(body.company),
    name: escapeHtml(body.name),
    nameKana: escapeHtml(body.nameKana),
    email: escapeHtml(body.email),
    phone: escapeHtml(body.phone),
    message: escapeHtml(body.message),
  };

  const cell =
    'padding: 8px 16px; border: 1px solid #ddd;';
  const head =
    'padding: 8px 16px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold; width: 150px;';

  const html = `
    <h2>お問い合わせがありました</h2>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <tr>
        <td style="${head}">御社名・部署名</td>
        <td style="${cell}">${e.company || '未入力'}</td>
      </tr>
      <tr>
        <td style="${head}">お名前</td>
        <td style="${cell}">${e.name}</td>
      </tr>
      <tr>
        <td style="${head}">ヨミガナ</td>
        <td style="${cell}">${e.nameKana || '未入力'}</td>
      </tr>
      <tr>
        <td style="${head}">メールアドレス</td>
        <td style="${cell}">${e.email}</td>
      </tr>
      <tr>
        <td style="${head}">電話番号</td>
        <td style="${cell}">${e.phone || '未入力'}</td>
      </tr>
      <tr>
        <td style="${head}">お問い合わせ内容</td>
        <td style="${cell} white-space: pre-wrap;">${e.message}</td>
      </tr>
    </table>
    <p style="margin-top: 24px; color: #555; font-size: 12px;">
      ${COMPANY_NAME} お問い合わせフォームより自動送信
    </p>
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: [ADMIN_TO],
    subject: `【お問い合わせ】${body.name}様より`,
    replyTo: body.email,
    html,
  });
}

/** 送信者宛: 受付完了の自動返信メール。 */
async function sendAutoReply(resend: Resend, body: ContactFormData) {
  const e = {
    company: escapeHtml(body.company),
    name: escapeHtml(body.name),
    nameKana: escapeHtml(body.nameKana),
    email: escapeHtml(body.email),
    phone: escapeHtml(body.phone),
    message: escapeHtml(body.message),
  };

  const cell =
    'padding: 6px 12px; border: 1px solid #e5e5e5; vertical-align: top;';
  const head =
    'padding: 6px 12px; border: 1px solid #e5e5e5; background: #f7f5f3; color: #555; font-weight: bold; width: 140px; vertical-align: top;';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Noto Sans JP', sans-serif; color: #1c1411; line-height: 1.8; max-width: 600px;">
      <p>${e.name} 様</p>
      <p>
        このたびは ${COMPANY_NAME} へお問い合わせをいただき、誠にありがとうございます。<br>
        下記の内容でお問い合わせを承りました。
      </p>
      <p>
        担当者より <strong>2〜3 営業日以内</strong> にご返信差し上げます。<br>
        ※土日祝日・年末年始休業日を除く営業日のご対応となります。<br>
        ※お急ぎの場合や、しばらく経ってもご連絡が届かない場合はお手数ですが再度ご連絡ください。
      </p>

      <h3 style="margin-top: 28px; border-left: 3px solid #DA2719; padding-left: 10px; font-size: 15px;">
        お問い合わせ内容
      </h3>
      <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
        <tr>
          <td style="${head}">御社名・部署名</td>
          <td style="${cell}">${e.company || '—'}</td>
        </tr>
        <tr>
          <td style="${head}">お名前</td>
          <td style="${cell}">${e.name}</td>
        </tr>
        <tr>
          <td style="${head}">ヨミガナ</td>
          <td style="${cell}">${e.nameKana || '—'}</td>
        </tr>
        <tr>
          <td style="${head}">メールアドレス</td>
          <td style="${cell}">${e.email}</td>
        </tr>
        <tr>
          <td style="${head}">電話番号</td>
          <td style="${cell}">${e.phone || '—'}</td>
        </tr>
        <tr>
          <td style="${head}">お問い合わせ内容</td>
          <td style="${cell} white-space: pre-wrap;">${e.message}</td>
        </tr>
      </table>

      <p style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; color: #555; font-size: 12px;">
        ${COMPANY_NAME}<br>
        <a href="${COMPANY_URL}" style="color: #DA2719;">${COMPANY_URL}</a>
      </p>
      <p style="color: #999; font-size: 11px;">
        このメールは自動返信です。本メールに直接ご返信いただいても担当者には届きません。<br>
        追加のご連絡が必要な場合は、お問い合わせフォームより改めてご送信いただくか、サイトに掲載の連絡先までご連絡ください。
      </p>
    </div>
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: [body.email],
    subject: `【受付完了】お問い合わせを承りました - ${COMPANY_NAME}`,
    // 自動返信に対する返信を info@ に流したい場合は replyTo を有効化
    replyTo: ADMIN_TO,
    html,
  });
}
