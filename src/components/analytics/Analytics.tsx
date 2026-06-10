import Script from 'next/script';

// アクセス解析タグ。ID は env で管理し、本番でのみ設定する想定。
// env 未設定（preview/dev 等）では一切スクリプトを読み込まない（完全 no-op）。
// タグ運用は GTM（Google タグマネージャー）を軸とする方針。GA4・広告タグ等は GTM コンテナ側で設定する。
// 直接 GA4（NEXT_PUBLIC_GA_ID）を併設すると GTM 内 GA4 と二重計測になるため、通常は未設定のままにする。
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

/**
 * Google タグマネージャー（GTM）+ Google Analytics 4 + Microsoft Clarity の計測タグ。
 * - 公開サイト（(site)）のみで読み込む（admin 配下では使わない）。
 * - 各 ID が env に設定されている時だけ該当タグを出力する。
 * - strategy="lazyOnload": 見た目に無関係なタグは onload 後まで後ろ倒しにする。
 */
export default function Analytics() {
  return (
    <>
      {GTM_ID && (
        <>
          <Script id="gtm-init" strategy="lazyOnload">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="lazyOnload"
          />
          <Script id="ga4-init" strategy="lazyOnload">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}

      {CLARITY_ID && (
        <Script id="ms-clarity" strategy="lazyOnload">
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
