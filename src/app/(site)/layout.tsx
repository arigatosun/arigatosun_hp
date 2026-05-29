import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Preloader from '@/components/ui/Preloader';
import JsonLd from '@/components/seo/JsonLd';
import { SITE_URL } from '@/lib/site';

// 全公開ページ共通の Organization 構造化データ。
const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '株式会社アリガトサン',
  alternateName: 'ARIGATOSUN',
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  description:
    'AI(LLM)システムの開発からデザイン・ブランディング、IPコンテンツ制作を行うクリエイティブスタジオです。',
  sameAs: ['https://www.instagram.com/arigatosun_inc'],
};

// 公開マーケサイト共通のレイアウト。Header / Footer はここで適用。
// /admin 配下はこのレイアウトを経由しないため、admin にこのメタデータも届かない。
export const metadata: Metadata = {
  // OG画像・canonical 等の相対 → 絶対URL解決の基準。
  metadataBase: new URL(SITE_URL),
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
    url: SITE_URL,
    siteName: '株式会社アリガトサン',
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
      <JsonLd data={ORGANIZATION_JSONLD} />
      <Preloader />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
