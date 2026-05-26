'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMediaQuery } from '@/lib/useMediaQuery';
import type { ServiceFlowStep } from '@/types/service';
import styles from './ServicePhaseSteps.module.scss';

type ServicePhaseStepsProps = {
  items: ServiceFlowStep[];
};

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
        {items.map((item, i) => (
          <li
            key={i}
            className={`${styles.item}${activeIdx === i ? ` ${styles.itemActive}` : ''}`}
            onMouseEnter={isPC ? () => setActiveIdx(i) : undefined}
          >
            <span className={styles.glow} aria-hidden />
            <span className={styles.dot} aria-hidden />
            <span className={styles.step}>{item.step}</span>
            <p className={styles.title}>{item.title}</p>
            <p className={styles.description}>{item.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
