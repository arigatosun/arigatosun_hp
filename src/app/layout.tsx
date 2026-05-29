import type { Metadata } from 'next';
import '@/styles/fonts.css';
import '@/styles/globals.scss';

// ルートには title.template を置かない。
// マーケ用 (公開) 側のテンプレートは app/(site)/layout.tsx、
// 管理画面側のテンプレートは app/admin/(authenticated)/layout.tsx で個別に定義する。
// これにより /admin と公開側で異なるサフィックスが付き、相互に汚染しない。
export const metadata: Metadata = {
  title: '株式会社アリガトサン | ARIGATOSUN',
};

// マーケ用ページの Header / Footer / <main> は app/(site)/layout.tsx で適用。
// /admin 配下は (site) を経由しないため、ここではグローバル CSS と html/body のみ持つ。
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {/* フォント配信元への事前接続（DNS/TLS を先行させ、描画ブロッキングを短縮）。
            React 19 が <link> を自動で <head> へホイストする。 */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {children}
      </body>
    </html>
  );
}
