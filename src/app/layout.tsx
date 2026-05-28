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
      <body>{children}</body>
    </html>
  );
}
