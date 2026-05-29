'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { FooterCharacterProps } from './FooterCharacter';

// dynamic import で SSR を切り、コンポーネントがレンダリングされるまで
// ./FooterCharacter モジュール (Three.js / R3F / GLB の preload を含む) を読み込まない。
const FooterCharacter = dynamic(() => import('./FooterCharacter'), { ssr: false });

// SP 判定の閾値 (PC ブレイクポイントと揃える)
const SP_MAX_WIDTH = 1023;

/**
 * Hero の 3D キャラクター (FooterCharacter) を遅延マウントするローダー。
 *
 * - PC (>=1024px): 即マウント (従来通り)。
 * - SP (<=1023px):
 *   1. `window.load` イベントを待つ (HTML/CSS/重要画像の取得完了)。
 *   2. その後 `requestIdleCallback` で idle 期間まで待つ (3s タイムアウト)。
 *   3. 環境的に IdleCallback が無ければ 1500ms の setTimeout フォールバック。
 *
 * これにより、SP で約 5.7MB の GLB と Three.js 関連の JS ~1.5MB が
 * 初期 LCP / TTI を阻害しないように後回しになる。
 */
export default function FooterCharacterLoader(props: FooterCharacterProps = {}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // SSR では window がないので effect 内で参照する
    const isSP = window.innerWidth <= SP_MAX_WIDTH;
    if (!isSP) {
      setMounted(true);
      return;
    }

    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;

    const scheduleIdleMount = () => {
      type IdleWindow = Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (handle: number) => void;
      };
      const w = window as IdleWindow;
      if (typeof w.requestIdleCallback === 'function') {
        idleHandle = w.requestIdleCallback(() => setMounted(true), { timeout: 3000 });
      } else {
        timeoutHandle = window.setTimeout(() => setMounted(true), 1500);
      }
    };

    if (document.readyState === 'complete') {
      scheduleIdleMount();
    } else {
      const onLoad = () => scheduleIdleMount();
      window.addEventListener('load', onLoad, { once: true });
      return () => {
        window.removeEventListener('load', onLoad);
        if (idleHandle != null) {
          const w = window as Window & { cancelIdleCallback?: (handle: number) => void };
          w.cancelIdleCallback?.(idleHandle);
        }
        if (timeoutHandle != null) window.clearTimeout(timeoutHandle);
      };
    }

    return () => {
      if (idleHandle != null) {
        const w = window as Window & { cancelIdleCallback?: (handle: number) => void };
        w.cancelIdleCallback?.(idleHandle);
      }
      if (timeoutHandle != null) window.clearTimeout(timeoutHandle);
    };
  }, []);

  if (!mounted) return null;
  return <FooterCharacter {...props} />;
}
