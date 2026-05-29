/**
 * サイトの正規ホスト（本番URL）。sitemap / robots / OG / canonical / JSON-LD /
 * メール本文リンク等、絶対URLが必要な箇所はすべてここを参照する。
 *
 * 公開ドメインは www を正規とする（apex `arigatosun.com` は www へリダイレクト）。
 * apex を正規にしたい場合はこの 1 箇所を変更し、Vercel 側のリダイレクト向きを揃える。
 */
export const SITE_URL = 'https://www.arigatosun.com';
