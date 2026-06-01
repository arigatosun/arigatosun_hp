import Script from 'next/script';

// アクセス解析タグ。ID は env で管理し、本番でのみ設定する想定。
// env 未設定（現状や preview/dev）では一切スクリプトを読み込まない（完全 no-op）。
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

/**
 * Google Analytics 4 + Microsoft Clarity の計測タグ。
 * - 公開サイト（(site)）のみで読み込む（admin 配下では使わない）。
 * - 各 ID が env に設定されている時だけ該当タグを出力する。
 * - strategy="afterInteractive": ページ描画を妨げない読み込み。
 */
export default function Analytics() {
  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}

      {CLARITY_ID && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_ID}");`}
        </Script>
      )}
    </>
  );
}
