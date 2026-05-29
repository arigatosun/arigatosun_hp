import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// 公開マーケサイト共通のレイアウト。Header / Footer はここで適用。
// /admin 配下はこのレイアウトを経由しないため、admin にこのメタデータも届かない。
export const metadata: Metadata = {
  title: {
    default: '株式会社アリガトサン | ARIGATOSUN',
    template: '%s | 株式会社アリガトサン',
  },
  description:
    'AI(LLM)システムの開発からデザイン・ブランディング、IPコンテンツ制作を行うクリエイティブスタジオです。',
  keywords: ['アリガトサン', 'AI開発', 'LLM', 'デザイン', 'ブランディング', 'IPコンテンツ'],
  openGraph: {
    title: '株式会社アリガトサン | ARIGATOSUN',
    description:
      'AI(LLM)システムの開発からデザイン・ブランディング、IPコンテンツ制作を行うクリエイティブスタジオです。',
    locale: 'ja_JP',
    type: 'website',
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
