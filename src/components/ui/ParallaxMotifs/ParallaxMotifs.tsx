'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './ParallaxMotifs.module.scss';
import { SP_MOTIFS_CONTAINER } from './motifs-sp-data';

// Figma SP (Group 1040 = ABOUT セクション全体): セクション上端 y=970、Group 933 (motifs container) 上端 y=1244。
// つまり motifs container はセクション上端から +274px の位置にあるが、
// 実装側の本文行間や letter-spacing 込みの体感差を吸収するため +20 して 294 にしている。
const SP_MOTIFS_OFFSET_FROM_ABOUT_TOP = 294;
// Figma SVG エクスポート (840×964) は内部の Group 933 コンテンツが上端 46.4px オフセットされている。
// SVG をスケール配置する際、この分を scale 込みで相殺して content 上端位置を揃える。
// （横方向は left:50% 中央寄せにしたため X オフセット相殺は不要になった）
const SP_SVG_CONTENT_OFFSET_Y = 46.4;

// SP（〜1023px）判定。SP では負荷軽減のため「継続モーション（浮遊・スクロール/マウス視差）」を
// 無効化する。入場・退場（ワンショットの transition）は PC 同様に有効。
const isSpViewport = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(max-width: 1023px)').matches;

// 赤モチーフ装飾（Figma「Group 870」書き出しの17シェイプ）。
// 基準位置は Figma 準拠。各モチーフのゆっくりした浮遊 + 全体のマウス追従（微視差）。
// SP（〜1023px）では Figma SP 専用の motif レイアウト（motifs-sp-data）を使う。
//   - Figma SP のモチーフコンテナ Y は固定の絶対座標 (1244) なので、そのまま使うと
//     実装側の ABOUT セクション位置（hero 高さなどに依存）と整合しない。
//   - useEffect で .about の offsetTop を取得し、Figma のコンテナ↔ABOUT 内部オフセットを
//     考慮した位置に動的に補正する。
export default function ParallaxMotifs() {
  const svgRef = useRef<SVGSVGElement>(null);
  const spImgRef = useRef<HTMLDivElement>(null);
  const [spMotifsTop, setSpMotifsTop] = useState<number>(
    SP_MOTIFS_CONTAINER.frameY,
  );
  // モチーフの「下から定位置への入場」アニメ用フラグ。
  // ABOUT 本文「しかし、」を含む要素 ([data-motifs-trigger]) が viewport に入ったら true。
  // 一度 true になったら戻さない（離脱して再表示で消えない方が自然）。
  const [entered, setEntered] = useState(false);
  // モチーフが「上方へバラバラに抜ける」退場アニメ用フラグ。
  // Service セクションがビューポートの上半分まで上がってきたら true。
  const [exited, setExited] = useState(false);

  // リロード時にブラウザが自動でスクロール位置を復元すると、
  // 「しかし、」が viewport 内に既にある状態で IO が即発火してアニメがスキップされる。
  // ユーザーが自分でスクロールして演出を見られるよう、TOP では auto-restore を無効化し
  // 初回マウント時にスクロールを最上部へ戻す。
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // ブラウザが既に復元処理を始めている場合に備え、次フレームで再度 0 にする
    window.scrollTo(0, 0);
    const raf = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // SP 用 combined SVG を inline 取得し、各 motif <g> に class を付与。
  // これで PC と同じく motif ごとにバラバラのフロート animation を当てられる。
  const [spInlineSvg, setSpInlineSvg] = useState<string>('');
  // SP モチーフの入場 transition を確実に発火させるためのゲート。
  // SVG は fetch で後から注入されるため、注入時点で既に entered=true だと
  // motif が定位置に直接生成され、初期状態(画面下)がペイントされず「パキッ」と出る
  // （PC の静的 SVG では初回レンダーが必ず entered=false なので起きない）。
  // → 注入後に必ず1フレーム entered=false を描画させてから実値を反映する。
  const [spReady, setSpReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch('/images/sections/about/sp-motifs-combined.svg')
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        // PC と同じ 2 階層構造にする:
        //   外側 <g class=spMotifEntry>（transform で「画面下 ⇄ 定位置」入場）
        //   内側 <g class=spMotif>（transform で浮遊）
        // combined SVG は各 motif が入れ子なしの <g filter><path/></g>（計17個）なので、
        // 開始タグを二重化し、全 </g> を二重化すればネストが揃う。
        let idx = 0;
        const withClass = text
          .replace(/<g filter="url\(#filter\d+_d_[^)]+\)">/g, (match) => {
            const i = idx++;
            return (
              `<g class="${styles.spMotifEntry}" data-motif-idx="${i}">` +
              match.replace('<g ', `<g class="${styles.spMotif}" `)
            );
          })
          .replace(/<\/g>/g, '</g></g>');
        setSpInlineSvg(withClass);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // SVG 注入後、1フレーム後に spReady=true にする。
  // 注入直後のレンダーは spReady=false（= data-entered を強制的に 'false'）で
  // 画面下の初期状態をペイントさせ、次フレームで実際の entered を反映して
  // transition を発火させる（パキッ防止）。
  useEffect(() => {
    if (!spInlineSvg) return;
    setSpReady(false);
    const raf = requestAnimationFrame(() => setSpReady(true));
    return () => cancelAnimationFrame(raf);
  }, [spInlineSvg]);

  // 「しかし、」のスクロール位置を監視し、motif の出入りを制御する。
  // - 「しかし、」の上端が viewport 中央 (50%) より上に来たら entered = true
  // - 戻って下に来たら entered = false → motif が画面下に戻る
  // - **下に通り過ぎ続けても entered=true を維持** することで、Service 等の
  //   後続セクションを表示中に motif が下方向に通過して干渉するのを防ぐ。
  //
  // body が scroll container になっている環境向けに、scroll listener は
  // window / document / body の3か所に貼り、加えて rAF で間引く。
  useEffect(() => {
    // 入場/退場は PC・SP 共通で有効（scroll 監視は軽量なワンショット判定）。
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEntered(true);
      return;
    }
    const trigger = document.querySelector('[data-motifs-trigger]') as HTMLElement | null;
    if (!trigger) {
      setEntered(true);
      return;
    }
    let raf = 0;
    const check = () => {
      const rect = trigger.getBoundingClientRect();
      // 集合開始を早める: トリガー上端が viewport 下から 82% の位置に達した時点で entered=true。
      // （0.5 だと about 見出しがかなり上に来てから集まり始め「完了が遅い」ため、早めに発火させる）
      const threshold = window.innerHeight * 0.82;
      // 上端がこの閾値より上に来たら entered=true（motif が散開→集合を開始）
      setEntered(rect.top < threshold);

      // 退場判定: Service セクションの上端がビューポートの上 40% に達したら
      // モチーフをバラバラと上方へ飛び抜けさせる。
      const serviceEl = document.querySelector<HTMLElement>(
        '[data-section="service"]'
      );
      if (serviceEl) {
        const sRect = serviceEl.getBoundingClientRect();
        setExited(sRect.top < window.innerHeight * 0.4);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    check(); // 初期チェック
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.body.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, true);
      document.body.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // マウス追従: カーソル位置に応じてモチーフ全体をわずかにずらす（微視差）
  // PC は SVG、SP は spImg の両方に同じ CSS 変数（--mx / --my）を反映する。
  useEffect(() => {
    // SP はマウス追従の微視差を無効化（タッチ端末では不要かつ再描画負荷源）。入場/退場は別途有効。
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || isSpViewport())
      return;
    const svg = svgRef.current;
    const spImg = spImgRef.current;
    const AMP = 18; // 最大ずれ幅(px)
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2 * AMP;
        const y = (e.clientY / window.innerHeight - 0.5) * 2 * AMP;
        const xStr = `${x.toFixed(1)}px`;
        const yStr = `${y.toFixed(1)}px`;
        if (svg) {
          svg.style.setProperty('--mx', xStr);
          svg.style.setProperty('--my', yStr);
        }
        if (spImg) {
          spImg.style.setProperty('--mx', xStr);
          spImg.style.setProperty('--my', yStr);
        }
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // スクロールパララックス: ABOUT セクションの中央付近をビューポート中央に
  // 合わせた時に進行度=0、上下にスクロールすると progress が ±1 に近づく。
  // その progress を CSS 変数 --py に反映してモチーフを「逆方向にゆっくり」ずらす。
  // PC・SP どちらも同じロジックで適用（CSS 側で transform に --py を組み込む）。
  useEffect(() => {
    // SP は scroll パララックス(--py)を無効化（毎フレームの filter 再描画を止める）。入場/退場は別途有効。
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || isSpViewport())
      return;
    const PARALLAX_AMP = 30; // 最大上下移動 (px) — 控えめ
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const spImg = spImgRef.current;
        const svg = svgRef.current;
        if (!spImg && !svg) return;
        const aboutSection = document.querySelector(
          'section[class*="about"]:not([class*="aboutContent"]):not([class*="aboutHeading"]):not([class*="aboutMessage"])',
        ) as HTMLElement | null;
        if (!aboutSection) return;
        const rect = aboutSection.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const vh = window.innerHeight;
        // -1 (section above viewport) ～ +1 (section below viewport)
        const progress = (sectionCenter - vh / 2) / (vh / 2 + rect.height / 2);
        const clamped = Math.max(-1, Math.min(1, progress));
        // 上にスクロール (section が上に流れる) → モチーフはさらに下に残り見える効果に
        const py = -clamped * PARALLAX_AMP;
        const pyStr = `${py.toFixed(1)}px`;
        if (spImg) spImg.style.setProperty('--py', pyStr);
        if (svg) svg.style.setProperty('--py', pyStr);
      });
    };
    // body が scroll container（globals.scss の overflow-x: hidden 起因）の場合、
    // window では scroll イベントが飛ばないため body にも listener を貼る。
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.body.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, true);
      document.body.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // 注入した SVG を useMemo で固定。spInlineSvg が変わらない限り同一の React 要素を返すため、
  // entered 切替や parallax で親が再レンダーされても <g> 要素は作り直されない（再生成による
  // 「パキッ」を防ぐ）。display:contents の span で包み、レイアウト/サイズに影響させない。
  const spSvgEl = useMemo(
    () =>
      spInlineSvg ? (
        <span
          style={{ display: 'contents' }}
          dangerouslySetInnerHTML={{ __html: spInlineSvg }}
        />
      ) : null,
    [spInlineSvg],
  );

  // SP モチーフ container の top を .about セクション位置から動的に算出
  // Figma SP: motifs container = section top + 274 に配置
  useEffect(() => {
    const compute = () => {
      const aboutSection = document.querySelector(
        'section[class*="about"]:not([class*="aboutContent"]):not([class*="aboutHeading"]):not([class*="aboutMessage"])',
      ) as HTMLElement | null;
      if (!aboutSection) return;
      // SVG 幅は CSS と同じ式: 840px を基準に、390 を超えた分を 0.5 倍で拡大。
      const actualWidth = 840 + (window.innerWidth - 390) * 0.5;
      const containerHeight = actualWidth * (964 / 840);
      // 縦は「中心」を about セクション基準で固定し、その中心の周りに対称スケールさせる。
      // → 390(スマホ) は従来と同じ位置、幅が広いほど上にも伸びて高い位置に見える。
      //   中心位置 = 390基準の top(294-46.4=247.6) + 高さ964/2 = 729.6（about top から）。
      const centerFromAboutTop =
        SP_MOTIFS_OFFSET_FROM_ABOUT_TOP - SP_SVG_CONTENT_OFFSET_Y + 964 / 2;
      setSpMotifsTop(
        aboutSection.offsetTop + centerFromAboutTop - containerHeight / 2,
      );
    };
    compute();
    window.addEventListener('resize', compute);
    // フォント・画像ロード等で layout が後追いで変わるケースに対応
    const observer = new ResizeObserver(compute);
    observer.observe(document.body);
    return () => {
      window.removeEventListener('resize', compute);
      observer.disconnect();
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* ── SP 専用 motif レイアウト（Figma SP 準拠） ── */}
      {/* SP 専用 motif: Figma が Group 1002 を 1 枚 SVG として書き出したもの (sp-motifs-combined.svg)。
          viewBox 840×964 は Group 933 (803×863) + shadow padding を含む。
          Figma SVG 内では Group 933 コンテンツが (12.3, 46.4) オフセットされているので、
          実装側でこの分を相殺した位置に配置する。 */}
      {/* inline SVG: 各 <g> に .spMotif class が付くので、SCSS 側で nth-of-type
          で異なる timing のフロート animation を当てる（バラバラに動く）。 */}
      <div
        ref={spImgRef}
        className={styles.spMotifs}
        data-entered={spReady && entered ? 'true' : 'false'}
        data-exited={spReady && exited ? 'true' : 'false'}
        style={{
          // left / width / height / aspect-ratio は CSS(@include sp)で中央配置＋幅比例スケール。
          // top のみ JS で about セクション基準（scale 補正済み）を渡す。
          top: `${spMotifsTop}px`,
        }}
        aria-hidden="true"
      >
        {spSvgEl}
      </div>

      {/* ── PC 用 SVG（〜1023px では非表示） ── */}
      <svg
        ref={svgRef}
        className={styles.svg}
        data-entered={entered ? 'true' : 'false'}
        data-exited={exited ? 'true' : 'false'}
        viewBox="0 0 1920 1919"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="motif-f0" x="1211.4" y="699.932" width="938.362" height="746.557" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.36 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f1" x="1644.7" y="406.465" width="378.081" height="292.875" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="7.5" dy="7.5"/>
            <feGaussianBlur stdDeviation="26.25"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f2" x="1101" y="1558.66" width="436.641" height="360.182" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="9" dy="9"/>
            <feGaussianBlur stdDeviation="37.5"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f3" x="-403.503" y="1049.25" width="813.137" height="623.488" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="7.5" dy="7.5"/>
            <feGaussianBlur stdDeviation="26.25"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f4" x="998.676" y="400.77" width="705.767" height="671.49" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f5" x="1130.01" y="551.404" width="944.825" height="810.766" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f6" x="761.534" y="1115.18" width="931.47" height="633.477" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f7" x="1015.31" y="920.273" width="252.933" height="252.934" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="7.5" dy="7.5"/>
            <feGaussianBlur stdDeviation="26.25"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f8" x="680.941" y="980.82" width="856.205" height="767.4" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.36 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f9" x="1287.15" y="0" width="657.449" height="521.146" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f10" x="-118.257" y="1279.78" width="780.866" height="497.26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.36 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f11" x="-52.6885" y="645.77" width="405.271" height="355.393" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="9" dy="9"/>
            <feGaussianBlur stdDeviation="37.5"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f12" x="632.996" y="1475.24" width="297.933" height="297.934" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="9" dy="9"/>
            <feGaussianBlur stdDeviation="37.5"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f13" x="1486.79" y="635.047" width="506.452" height="453.416" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="7.5" dy="7.5"/>
            <feGaussianBlur stdDeviation="26.25"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f14" x="1443.52" y="1054.45" width="546.563" height="583.689" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="33" dy="42"/>
            <feGaussianBlur stdDeviation="75"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f15" x="-209.064" y="840.025" width="396.239" height="394.93" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="9" dy="9"/>
            <feGaussianBlur stdDeviation="37.5"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <filter id="motif-f16" x="1349.43" y="1184.46" width="728.503" height="481.826" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="7.5" dy="7.5"/>
            <feGaussianBlur stdDeviation="26.25"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
            <feBlend mode="multiply" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
        </defs>

        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f0)"><path d="M1441.54 807.932L1588.77 1025.19C1654.27 1121.81 1785.54 1146.92 1882.03 1081.56L1890.08 1076.1L1966.77 1189.24L1958.71 1194.69C1802.6 1300.45 1590.4 1262.09 1481.1 1109.93L1328.4 884.619L1441.54 807.932Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f1)"><path d="M1962.79 584.475L1932.76 451.465L1689.7 506.33L1719.73 639.34L1962.79 584.475Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f2)"><path d="M1411.99 1834.84L1453.64 1700.77L1208.65 1624.66L1167 1758.72L1411.99 1834.84Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f3)"><path d="M226.544 1612.73L98.7104 1348.99C47.9583 1244.41 -78.1999 1201.08 -183.27 1252.05L-299.057 1308.29L-358.503 1185.73L-242.601 1129.42C-72.8546 1046.88 131.324 1114.62 217.482 1280.29L349.634 1552.71L226.587 1612.55L226.544 1612.73Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f4)"><path d="M1433.77 508.77L1115.68 775.828L1203.35 880.26L1521.44 613.202L1433.77 508.77Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f5)"><path d="M1766.36 659.547L1626.5 912.489C1567.32 1019.47 1432.29 1058.3 1325.28 999.288L1316.34 994.348L1247.01 1119.79L1255.96 1124.73C1429.08 1220.34 1647.23 1160.1 1747.04 990.729L1891.84 728.705L1766.35 659.405L1766.36 659.547Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f6)"><path d="M948.872 1556.65L1205.83 1385.7C1289.66 1329.92 1403.12 1340.6 1475.68 1410.87L1482.11 1417.19L1510 1277.31L1507.19 1275.5C1394.53 1204.96 1250.74 1205.89 1139.6 1277.4L878.534 1450.99L948.967 1556.56L948.872 1556.65Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f7)"><path d="M1111.27 965.274L1060.31 1062.25L1157.29 1113.21L1208.24 1016.23L1111.27 965.274Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f8)"><path d="M1354.15 1442.19L972.408 1256.53C1001.95 1224.46 1039.97 1202.47 1081.23 1192.24L988.033 1088.82C917.49 1121.24 857.272 1177.26 820.677 1252.27C812.027 1270.16 804.646 1289.22 799.118 1308.82L797.941 1312.77L1298.49 1556.22L1354.02 1442.13L1354.15 1442.19Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f9)"><path d="M1439.03 329.146L1761.6 249.791L1726.71 107.999L1404.15 187.354L1439.03 329.146Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f10)"><path d="M18.3198 1387.78L-1.25684 1512.82L460.033 1585.04L479.609 1460L18.3198 1387.78Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f11)"><path d="M64.6331 711.769L13.3115 823.379L217.262 917.161L268.583 805.551L64.6331 711.769Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f12)"><path d="M749.953 1541.24L698.996 1638.22L795.972 1689.18L846.929 1592.2L749.953 1541.24Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f13)"><path d="M1635.11 820.637C1734.47 835.179 1811.74 918.872 1818.82 1019.57L1819.43 1028.46L1933.24 943.206L1932.24 939.919C1895.56 812.192 1788.12 716.942 1657.81 695.829L1549.82 680.046L1531.79 805.55L1634.97 820.661L1635.11 820.637Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f14)"><path d="M1690.88 1446.14L1807.09 1374.8L1676.73 1162.44L1560.52 1233.78L1690.88 1446.14Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f15)"><path d="M-56.9952 1150.96L103.175 993.678L17.1057 906.026L-143.064 1063.3L-56.9952 1150.96Z" fill="var(--color-primary)"/></g></g>
        <g className={styles.motifEntry}><g className={styles.motif} filter="url(#motif-f16)"><path d="M1962.62 1229.46L1394.43 1481.66L1449.75 1606.29L2017.94 1354.09L1962.62 1229.46Z" fill="var(--color-primary)"/></g></g>
      </svg>
    </div>
  );
}
