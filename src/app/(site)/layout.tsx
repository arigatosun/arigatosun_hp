import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Preloader from '@/components/ui/Preloader';
import { PRELOADER_SESSION_KEY } from '@/components/ui/Preloader/sessionKey';
import ScrollAnchorOnResize from '@/components/ui/ScrollAnchorOnResize';
import JsonLd from '@/components/seo/JsonLd';
import Analytics from '@/components/analytics/Analytics';
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
      <Analytics />
      <JsonLd data={ORGANIZATION_JSONLD} />
      {/* 描画前に走らせる初期化スクリプト（FOUC / スクロールちらつき対策）。
          1. 再訪問（sessionStorage にフラグあり）ならオープニングを描画前に隠す。
             <style> は SSR HTML に含まれ初回ペイント前に確実に適用される
             （CSS Module は dev で JS 注入のためペイントに間に合わない）。
          2. TOP では scrollRestoration を描画前に 'manual' にし、ブラウザの
             スクロール位置自動復元を止める。ParallaxMotifs は effect（＝ペイント後）で
             これを行うため、リロード時に「前回位置で描画→トップへガクッと移動」する
             スクロールの往復が見えていた。描画前に止めれば最初からトップで描画される。 */}
      <style
        dangerouslySetInnerHTML={{
          __html: 'html.preloaded [data-preloader]{display:none!important}',
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem('${PRELOADER_SESSION_KEY}'))document.documentElement.classList.add('preloaded');if(location.pathname==='/'&&'scrollRestoration' in history)history.scrollRestoration='manual';}catch(e){}`,
        }}
      />
      <Preloader />
      <ScrollAnchorOnResize />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
