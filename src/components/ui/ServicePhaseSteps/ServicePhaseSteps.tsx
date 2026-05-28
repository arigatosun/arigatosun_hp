'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useMediaQuery } from '@/lib/useMediaQuery';
import type { ServiceFlowStep } from '@/types/service';
import styles from './ServicePhaseSteps.module.scss';

type ServicePhaseStepsProps = {
  items: ServiceFlowStep[];
};

// Figma SP「Group 1213」(SVG) の円中心 Y 位置 (PHASE.1〜4)
const SP_CIRCLE_Y = [40.6, 170.6, 324.6, 478.6];
const SP_SVG_HEIGHT = 568;

/**
 * IP/CREATIVE「IPの育て方・進め方」セクションの右カラム。
 * - 左: Figma Group 1141 (64x1488) の縦線 + 4 円インジケーター
 * - 右: 4 PHASE の見出し + 説明文を 186px 間隔で並べる
 * - 行ホバーで該当円が赤に点灯し、テキスト周辺に赤いソフトグローが出る
 *   （AI/DEV ServiceFlowSteps と同じ演出）
 */
export default function ServicePhaseSteps({ items }: ServicePhaseStepsProps) {
  const isPC = useMediaQuery('(min-width: 768px)');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // SP: 画面中央を発火ラインにして、現在「読まれている」PHASE を 1 つだけ active にする。
  const indicatorWrapRef = useRef<HTMLDivElement>(null);
  const [spActiveIdx, setSpActiveIdx] = useState(-1);

  useEffect(() => {
    if (isPC) {
      setSpActiveIdx(-1);
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const wrap = indicatorWrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const triggerY = window.innerHeight / 2;

      let active = -1;
      for (let i = 0; i < SP_CIRCLE_Y.length; i++) {
        const circleViewportY = rect.top + SP_CIRCLE_Y[i];
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
      <div ref={indicatorWrapRef} className={styles.indicatorSpWrap} aria-hidden>
        <Image
          className={styles.indicatorSp}
          src="/images/sections/service/detail/phase-indicator-sp.svg"
          alt=""
          width={20}
          height={SP_SVG_HEIGHT}
        />
      </div>
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
              <span className={styles.dot} aria-hidden />
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
