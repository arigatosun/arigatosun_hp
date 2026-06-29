'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useMediaQuery } from '@/lib/useMediaQuery';
import type { ServiceFlowStep } from '@/types/service';
import styles from './ServiceFlowSteps.module.scss';

type ServiceFlowStepsProps = {
  items: ServiceFlowStep[];
};

/**
 * PROCESS（進め方）の縦並びステップリスト。
 * - 左カラム: PC は Figma Group 898（32×705）SVG を敷き、5 円を縦線で繋ぐ。
 *   SP は CSS で円（外円リング + 内側ドット）と縦線を描画する（content-driven）。
 * - 右カラム: 5 STEP の見出し + 説明文。SP は高さを内容に追従させる。
 * - ヒット領域は <li> 全幅で、左の円をホバーしてもそのまま行が active になる。
 * - active 行は: ① 左円が赤に点灯（.dot） ② 円周辺に赤いソフトグロー（.glow）
 *   テキスト色は黒のまま（変更しない）
 * - SP は画面中央を発火ラインに、現在「読まれている」STEP を 1 つだけ active にする。
 *   円の位置は各 .dot の実測値（getBoundingClientRect）から判定する。
 */
export default function ServiceFlowSteps({ items }: ServiceFlowStepsProps) {
  const isPC = useMediaQuery('(min-width: 768px)');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // SP: 各円（.dot）の実測中心が画面中央を上から通過するたびに active が次へ移る。
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [spActiveIdx, setSpActiveIdx] = useState(-1);

  useEffect(() => {
    // PC では spActiveIdx を参照しない（描画は activeIdx を使用）ため、
    // スクロール監視のセットアップだけ SP に限定する。
    if (isPC) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const triggerY = window.innerHeight / 2;

      let active = -1;
      for (let i = 0; i < dotRefs.current.length; i++) {
        const dot = dotRefs.current[i];
        if (!dot) continue;
        const rect = dot.getBoundingClientRect();
        const circleViewportY = rect.top + rect.height / 2;
        if (circleViewportY <= triggerY) {
          active = i;
        } else {
          break;
        }
      }
      setSpActiveIdx(active);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isPC]);

  return (
    <div
      className={styles.root}
      onMouseLeave={isPC ? () => setActiveIdx(null) : undefined}
    >
      <Image
        className={styles.indicator}
        src="/images/sections/service/detail/process-indicator.svg"
        alt=""
        width={32}
        height={705}
        aria-hidden
      />
      <ol className={styles.list}>
        {items.map((item, i) => {
          // active 判定: PC は単一 hover、SP はスクロール位置に応じた単一の STEP
          const isActive = isPC ? activeIdx === i : spActiveIdx === i;
          return (
            <li
              key={i}
              className={`${styles.item}${isActive ? ` ${styles.itemActive}` : ''}`}
              onMouseEnter={isPC ? () => setActiveIdx(i) : undefined}
            >
              <span className={styles.glow} aria-hidden />
              <span
                className={styles.dot}
                aria-hidden
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
              />
              <span className={styles.step}>{item.step}</span>
              <p className={styles.title}>{item.title}</p>
              <p className={styles.description}>{item.description}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
