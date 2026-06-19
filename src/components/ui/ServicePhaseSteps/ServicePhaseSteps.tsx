'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useMediaQuery } from '@/lib/useMediaQuery';
import type { ServiceFlowStep } from '@/types/service';
import styles from './ServicePhaseSteps.module.scss';

type ServicePhaseStepsProps = {
  items: ServiceFlowStep[];
};

/**
 * IP/CREATIVE「IPの育て方・進め方」セクションの右カラム。
 * - 左: PC は Figma Group 1141 (64x1488) の縦線 + 4 円インジケーター。
 *   SP は CSS で円（外円リング + 内側ドット）と縦線を描画する（content-driven）。
 * - 右: 4 PHASE の見出し + 説明文。SP は高さを内容に追従させる。
 * - 行ホバー（PC）/ スクロール位置（SP）で該当円が赤に点灯し、赤いソフトグローが出る。
 * - SP は画面中央を発火ラインに、各 .dot の実測中心位置から active を判定する。
 */
export default function ServicePhaseSteps({ items }: ServicePhaseStepsProps) {
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
        src="/images/sections/service/detail/phase-indicator.png"
        alt=""
        width={64}
        height={1488}
        aria-hidden
      />
      <ol className={styles.list}>
        {items.map((item, i) => {
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
