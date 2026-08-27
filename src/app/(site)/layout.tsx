import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FooterGate from '@/components/layout/Footer/FooterGate';
import Preloader from '@/components/ui/Preloader';
import { PRELOADER_SESSION_KEY } from '@/components/ui/Preloader/sessionKey';
import ScrollAnchorOnResize from '@/components/ui/ScrollAnchorOnResize';
import JsonLd from '@/components/seo/JsonLd';
import Analytics from '@/components/analytics/Analytics';
import WebMcpProvider from '@/components/layout/WebMcpProvider';
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
      <WebMcpProvider />
      <JsonLd data={ORGANIZATION_JSONLD} />
      {/* 描画前に走らせる初期化スクリプト（FOUC / スクロールちらつき対策）。
          1. 再訪問（sessionStorage にフラグあり）ならオープニングを描画前に隠す。
             <style> は SSR HTML に含まれ初回ペイント前に確実に適用される
             （CSS Module は dev で JS 注入のためペイントに間に合わない）。
          2. TOP のスクロール位置制御。scrollRestoration は既定の 'auto' のまま触らない
             （＝ブラウザ/Next の標準復元が効き、記事等から戻ると元の位置に復元される。
               これが上司要望の「戻ったら位置を保持」）。
             ただし TOP の reload（リロード）だけは、モチーフ入場演出を頭から見せるため
             先頭固定にしたい。auto では前回位置に復元されるので、描画後に明示的に
             scrollTo(0,0) で先頭へ戻す（Next/ブラウザの復元を打ち消す。数フレーム繰り返して
             復元タイミングのブレを吸収する）。navigate（新規アクセス）は復元対象が無いので
             そのまま先頭表示になり、back_forward（戻る・進む）は復元を尊重する。
             ※ 以前は scrollRestoration='manual' を使っていたが、これは戻る/進むの復元まで
               無効化し（TOP を一度踏むと SPA 遷移で他ページの戻る復元も壊れる）、要望と
               衝突するため廃止した。制御はここに一本化（ParallaxMotifs は About 手前まで
               遅延マウントされ初回描画に間に合わないため）。 */}
      <style
        dangerouslySetInnerHTML={{
          __html: 'html.preloaded [data-preloader]{display:none!important}',
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem('${PRELOADER_SESSION_KEY}'))document.documentElement.classList.add('preloaded');if(location.pathname==='/'){var n=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];if(n&&n.type==='reload'){var ft=function(){window.scrollTo(0,0);};addEventListener('load',function(){ft();var c=0,iv=setInterval(function(){ft();if(++c>=8)clearInterval(iv);},60);},{once:true});}}}catch(e){}`,
        }}
      />
      <Preloader />
      <ScrollAnchorOnResize />
      <Header />
      <main>{children}</main>
      <FooterGate>
        <Footer />
      </FooterGate>
    </>
  );
}
