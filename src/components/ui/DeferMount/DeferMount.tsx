'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface DeferMountProps {
  children: ReactNode;
  /** ビューポートに近づいたら子をマウントする時に監視する要素のセレクタ。
   *  未指定なら自身のラッパー div を監視する。 */
  targetSelector?: string;
  /** ビューポート手前どれだけで先読みマウントするか（IntersectionObserver の rootMargin）。 */
  rootMargin?: string;
  /** ラッパー div に付与するクラス（既存のサイズ指定クラスをそのまま渡す）。 */
  className?: string;
}

/**
 * 子要素（主に重い 3D ローダー）を、対象がビューポートに近づくまでマウントしない遅延ローダー。
 * - FV 外の 3D の初回ダウンロード/Canvas マウントを先送りして初期表示を軽くする。
 * - IntersectionObserver 非対応環境では即マウント（フォールバック）。
 */
export default function DeferMount({
  children,
  targetSelector,
  rootMargin = '800px',
  className,
}: DeferMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const target = targetSelector
      ? document.querySelector(targetSelector)
      : ref.current;
    if (!target || typeof IntersectionObserver === 'undefined') {
      // 監視できない環境では次フレームでマウント（effect 内の同期 setState を避ける）
      const raf = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [mounted, targetSelector, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {mounted ? children : null}
    </div>
  );
}
