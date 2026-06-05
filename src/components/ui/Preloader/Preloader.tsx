'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { PRELOADER_SESSION_KEY as SESSION_KEY } from './sessionKey';
import { isHeroReady, onHeroReady } from '@/lib/openingSync';
import styles from './Preloader.module.scss';

// SSR では window が無いので useLayoutEffect が警告を出す。
// クライアントでは初回ペイント前に走らせて「再訪問時のチラつき」を防ぎたいので、
// 環境に応じて layout/effect を出し分ける。
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * サイト初回表示時のオープニング（プリローダー）。Figma: OPENING (3106:43726)。
 * - 赤背景（横スキャンライン）に「回転する白い太陽 → 白ゲージ → % 数字」を縦中央配置
 * - ゲージと数字は実読み込み進捗に連動（0→100）
 * - 100% で太陽が拡大しつつ背景が赤→白へ遷移し、TOP を出して終了
 * - セッション中は一度だけ（sessionStorage）。prefers-reduced-motion を尊重
 */
export default function Preloader() {
  const pathname = usePathname();
  // 入口ページがプライバシーポリシーの場合はオープニングを出さない。
  // (site) レイアウトはページ遷移で再マウントされないため、マウント時の入口で確定させる。
  const [skipOpening] = useState(() => pathname === '/privacy');
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLImageElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    // プライバシーポリシーが入口ページなら、オープニング処理を一切行わない
    // （アニメ・スクロールロック・sessionStorage 書き込みすべてスキップ）。
    if (skipOpening) return;

    // 既にこのセッションで表示済みなら何もしない（ペイント前に消す）。
    if (sessionStorage.getItem(SESSION_KEY)) {
      setVisible(false);
      return;
    }
    sessionStorage.setItem(SESSION_KEY, '1');

    // 表示中はスクロールをロック。
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const unlock = () => {
      document.body.style.overflow = prevOverflow;
    };

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // 最低表示時間（ms）と、読み込みが来ない場合の上限時間（ms）。
    const MIN_VISIBLE_MS = 1000;
    const MAX_VISIBLE_MS = 6000;
    const startedAt = performance.now();

    // 遷移先（＝TOP の背景色）を実値で取得し、赤→白の終端を一致させる。
    const pageBg =
      getComputedStyle(document.body).backgroundColor || '#ffffff';

    // 重い3D初期化等でフレームが詰まると GSAP の lagSmoothing が時間進行を
    // 止め、カウンタが固まって見える。表示中だけ無効化し、復元する。
    gsap.ticker.lagSmoothing(0);

    let onLoad: (() => void) | null = null;
    let minTimer = 0;
    let maxTimer = 0;
    let finished = false;
    let offHeroReady: (() => void) | null = null;

    const ctx = gsap.context(() => {
      const sun = sunRef.current;
      // 太陽を中心基準で回転・拡大できるように。
      gsap.set(sun, { transformOrigin: '50% 50%' });

      const reveal = () => {
        unlock();
        setVisible(false);
      };

      // モーション抑制設定: アニメせず満タン表示→素早くフェード。
      if (prefersReduced) {
        setProgress(100);
        minTimer = window.setTimeout(() => {
          gsap.to(rootRef.current, {
            autoAlpha: 0,
            duration: 0.4,
            onComplete: reveal,
          });
        }, 500);
        return;
      }

      // 太陽の常時回転（くるくる）。
      gsap.to(sun, {
        rotation: 360,
        duration: 3.2,
        ease: 'none',
        repeat: -1,
      });

      const counter = { v: 0 };

      // 100% まで詰め、太陽拡大＋赤→白遷移してから TOP を出す（一度だけ）。
      const finish = () => {
        if (finished) return;
        finished = true;
        gsap.killTweensOf(counter);

        const tl = gsap.timeline({ onComplete: reveal });
        // ゲージを 100% へ。
        tl.to(counter, {
          v: 100,
          duration: 0.4,
          ease: 'power2.out',
          onUpdate: () => setProgress(Math.round(counter.v)),
        });
        // ゲージ・数字・スキャンラインをフェードアウト。
        tl.to(
          [meterRef.current, scanRef.current],
          { autoAlpha: 0, duration: 0.35 },
          '+=0.05'
        );
        // 太陽が大きくなる（回転は継続）。
        tl.to(
          sun,
          { scale: 18, duration: 0.95, ease: 'power2.in' },
          '<'
        );
        // 背景が赤→白（TOP の背景色）へ。
        tl.to(
          rootRef.current,
          { backgroundColor: pageBg, duration: 0.7, ease: 'power1.inOut' },
          '<'
        );
        // オーバーレイをフェードアウトして TOP を表示。
        tl.to(
          rootRef.current,
          { autoAlpha: 0, duration: 0.45, ease: 'power1.out' },
          '-=0.2'
        );
      };

      // 0 → 90 はローディング感の装飾（完了判定には使わない）。
      gsap.to(counter, {
        v: 90,
        duration: 1.4,
        ease: 'power1.out',
        onUpdate: () => setProgress(Math.round(counter.v)),
      });

      // 完了条件は「window load 済」かつ「ヒーロー3Dの初回描画完了」の両方。
      // どちらかが揃っていなくても MAX_VISIBLE_MS のフェイルセーフで必ず終了する
      // （回線が遅い等で 3D が間に合わない時にオープニングが固まらないように）。
      let windowLoaded = document.readyState === 'complete';
      let heroDone = isHeroReady();
      let scheduled = false;
      const tryFinish = () => {
        if (scheduled || !windowLoaded || !heroDone) return;
        scheduled = true;
        const wait = Math.max(
          0,
          MIN_VISIBLE_MS - (performance.now() - startedAt)
        );
        minTimer = window.setTimeout(finish, wait);
      };

      if (!windowLoaded) {
        onLoad = () => {
          windowLoaded = true;
          tryFinish();
        };
        window.addEventListener('load', onLoad, { once: true });
      }
      offHeroReady = onHeroReady(() => {
        heroDone = true;
        tryFinish();
      });
      tryFinish(); // 両方すでに揃っている場合に即スケジュール
      // フェイルセーフ（rAF / 3D 完了に依存しない setTimeout）。
      maxTimer = window.setTimeout(finish, MAX_VISIBLE_MS);
    }, rootRef);

    return () => {
      if (onLoad) window.removeEventListener('load', onLoad);
      if (offHeroReady) offHeroReady();
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      gsap.ticker.lagSmoothing(500, 33); // GSAP デフォルトに復元
      ctx.revert();
      unlock();
    };
  }, [skipOpening]);

  if (skipOpening || !visible) return null;

  return (
    <div
      ref={rootRef}
      className={styles.preloader}
      data-preloader
      role="progressbar"
      aria-label="サイトを読み込み中"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div ref={scanRef} className={styles.scanlines} aria-hidden="true" />

      <div className={styles.inner}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={sunRef}
          className={styles.sun}
          src="/images/sections/hero/sun-white.svg"
          alt=""
          aria-hidden="true"
          width={96}
          height={93}
        />

        <div ref={meterRef} className={styles.meter}>
          <div className={styles.gaugeTrack}>
            <div className={styles.gaugeFill} style={{ width: `${progress}%` }} />
          </div>
          <p className={styles.percent} aria-hidden="true">
            {progress}
            <span className={styles.percentSign}>%</span>
          </p>
        </div>
      </div>
    </div>
  );
}
