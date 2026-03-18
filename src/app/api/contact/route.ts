import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactFormData {
  company: string;
  name: string;
  nameKana: string;
  email: string;
  phone: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    const body: ContactFormData = await request.json();

    // 必須項目のバリデーション
    if (!body.name || !body.nameKana || !body.email || !body.message) {
      return NextResponse.json(
        { error: '必須項目を入力してください。' },
        { status: 400 }
      );
    }

    // info@arigatosun.com 宛にメール送信
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
            <td style="padding: 8px 16px; border: 1px solid #ddd;">${body.nameKana}</td>
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
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
