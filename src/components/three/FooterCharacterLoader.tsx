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
export default function FooterCharacterLoader({
  // priority=true: SP の idle 遅延をスキップして即マウントする。
  // Hero はオープニング中に 3D を先読みしたい（画面はオープニングで覆われており LCP に影響
  // しない）ため true で渡す。footer/works 等の FV 外用途は従来どおり SP 遅延を維持。
  priority = false,
  ...props
}: FooterCharacterProps & { priority?: boolean } = {}) {
  // priority 指定時は SP でも即マウント（オープニング中の 3D 先読み用）なので、
  // effect を待たず初期値で true にする（描画後の setState による再レンダーを避ける）。
  const [mounted, setMounted] = useState(priority);

  useEffect(() => {
    if (priority) return;
    // SSR では window がないので effect 内で参照する
    const isSP = window.innerWidth <= SP_MAX_WIDTH;

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

    const cleanup = () => {
      if (idleHandle != null) {
        const w = window as Window & { cancelIdleCallback?: (handle: number) => void };
        w.cancelIdleCallback?.(idleHandle);
      }
      if (timeoutHandle != null) window.clearTimeout(timeoutHandle);
    };

    if (!isSP) {
      // PC は遅延なしでマウント。effect 内の同期 setState は再レンダーを
      // カスケードさせる（react-hooks/set-state-in-effect）ため、次タスクに回す。
      timeoutHandle = window.setTimeout(() => setMounted(true), 0);
      return cleanup;
    }

    if (document.readyState === 'complete') {
      scheduleIdleMount();
      return cleanup;
    }

    const onLoad = () => scheduleIdleMount();
    window.addEventListener('load', onLoad, { once: true });
    return () => {
      window.removeEventListener('load', onLoad);
      cleanup();
    };
  }, [priority]);

  if (!mounted) return null;
  return <FooterCharacter {...props} />;
}
