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

// CF7 が返す status: "mail_sent" | "mail_failed" | "validation_failed" | "spam" | "aborted"
interface Cf7Response {
  status: string;
  message?: string;
  invalid_fields?: Array<{ field: string; message: string }>;
}

/**
 * お問い合わせフォーム送信エンドポイント。
 *
 * 環境変数で送信先を切り替える二段構え：
 * 1. CF7_FORM_ID が設定されている時 → WordPress + Contact Form 7 へ転送
 * 2. それ以外（未設定） → Resend で info@arigatosun.com に直接メール送信
 *
 * CF7 側で必要な準備：
 *   - Contact Form 7 プラグインを有効化
 *   - フィールド名を以下に揃えたフォームを作成し、ID を CF7_FORM_ID に設定
 *     [text* your-name] / [text your-name-kana] / [text your-company]
 *     [email* your-email] / [tel your-phone] / [textarea* your-message]
 *   - メール送信先 / 本文テンプレートは CF7 管理画面で設定
 *   - 別ドメインの場合は WordPress 側で wp-json の CORS 許可が必要
 */
export async function POST(request: Request) {
  try {
    const body: ContactFormData = await request.json();

    // 必須項目のバリデーション
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: '必須項目を入力してください。' },
        { status: 400 },
      );
    }

    const cf7FormId = process.env.CF7_FORM_ID;
    const wpBase = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

    // ── 1) CF7 経由（環境変数が揃っている時） ──
    if (cf7FormId && wpBase) {
      return await sendViaCf7(wpBase, cf7FormId, body);
    }

    // ── 2) Resend 直送（フォールバック / 未連携時） ──
    return await sendViaResend(body);
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 },
    );
  }
}

/**
 * Contact Form 7 の REST API に multipart/form-data で転送する。
 * CF7 は JSON を受け付けず必ず FormData が必要。
 */
async function sendViaCf7(
  wpBase: string,
  formId: string,
  body: ContactFormData,
) {
  const form = new FormData();
  form.append('your-name', body.name);
  form.append('your-name-kana', body.nameKana);
  form.append('your-company', body.company);
  form.append('your-email', body.email);
  form.append('your-phone', body.phone);
  form.append('your-message', body.message);

  const res = await fetch(
    `${wpBase.replace(/\/$/, '')}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`,
    { method: 'POST', body: form },
  );

  const data: Cf7Response = await res.json().catch(() => ({ status: 'mail_failed' }));

  if (data.status === 'mail_sent') {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    {
      error: data.message || '送信に失敗しました。',
      invalidFields: data.invalid_fields,
    },
    { status: data.status === 'validation_failed' ? 400 : 500 },
  );
}

/**
 * Resend で info@arigatosun.com に直接メール送信する（WP 未接続時のフォールバック）。
 */
async function sendViaResend(body: ContactFormData) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'メール送信先が設定されていません。' },
      { status: 500 },
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: 'お問い合わせフォーム <noreply@arigatosun.com>',
    to: ['info@arigatosun.com'],
    subject: `【お問い合わせ】${body.name}様より`,
    replyTo: body.email,
    html: `
      <h2>お問い合わせがありました</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 8px 16px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold; width: 150px;">御社名・部署名</td>
          <td style="padding: 8px 16px; border: 1px solid #ddd;">${body.company || '未入力'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">お名前</td>
          <td style="padding: 8px 16px; border: 1px solid #ddd;">${body.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">ヨミガナ</td>
          <td style="padding: 8px 16px; border: 1px solid #ddd;">${body.nameKana || '未入力'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">メールアドレス</td>
          <td style="padding: 8px 16px; border: 1px solid #ddd;">${body.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">電話番号</td>
          <td style="padding: 8px 16px; border: 1px solid #ddd;">${body.phone || '未入力'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 16px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">お問い合わせ内容</td>
          <td style="padding: 8px 16px; border: 1px solid #ddd; white-space: pre-wrap;">${body.message}</td>
        </tr>
      </table>
    `,
  });

  if (error) {
    console.error('Resend error:', error);
    return NextResponse.json(
      { error: 'メールの送信に失敗しました。' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
