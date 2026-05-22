'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMediaQuery } from '@/lib/useMediaQuery';
import type { ServiceFlowStep } from '@/types/service';
import styles from './ServiceFlowSteps.module.scss';

type ServiceFlowStepsProps = {
  items: ServiceFlowStep[];
};

/**
 * PROCESS（進め方）の縦並びステップリスト。
 * - 左カラム: Figma Group 898（32×705）SVG を敷き、5 円を縦線で繋ぐ
 * - 右カラム: 5 STEP の見出し + 説明文を 148px 間隔で並べる
 * - ヒット領域は <li> 全幅（root 全幅）で、左の円をホバーしてもそのまま行が active になる
 * - active 行は: ① 左円が赤に点灯（.dot） ② 円周辺に赤いソフトグロー（Ellipse 13.svg）
 *   テキスト色は黒のまま（変更しない）
 */
export default function ServiceFlowSteps({ items }: ServiceFlowStepsProps) {
  const isPC = useMediaQuery('(min-width: 768px)');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

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
