'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useMediaQuery } from '@/lib/useMediaQuery';
import type { ServiceFlowStep } from '@/types/service';
import styles from './ServiceFlowSteps.module.scss';

type ServiceFlowStepsProps = {
  items: ServiceFlowStep[];
};

// Figma SP「Group 12072」(SVG) の円中心 Y 位置
const SP_CIRCLE_Y = [33, 140, 249, 379, 487];
const SP_SVG_HEIGHT = 533;

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

  // SP: 画面中央を発火ラインにして、現在「読まれている」STEP を 1 つだけ active にする。
  // 各円中心が trigger line を上から下に通過するたびに active が次の STEP へ移る。
  const indicatorWrapRef = useRef<HTMLDivElement>(null);
  const [spActiveIdx, setSpActiveIdx] = useState(-1);

  useEffect(() => {
    // PC では spActiveIdx を参照しない（描画は activeIdx を使用）ため、
    // ここでのリセットは不要。スクロール監視のセットアップだけ SP に限定する。
    if (isPC) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const wrap = indicatorWrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      // 画面中央を起点に。中央より上にある最後の円を active にする。
      // → 次の円が中央に到達した瞬間に active がそっちに移り、前の円は元のグレーへ戻る。
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
        src="/images/sections/service/detail/process-indicator.svg"
        alt=""
        width={32}
        height={705}
        aria-hidden
      />
      <div ref={indicatorWrapRef} className={styles.indicatorSpWrap} aria-hidden>
        <Image
          className={styles.indicatorSp}
          src="/images/sections/service/detail/process-indicator-sp.svg"
          alt=""
          width={20}
          height={SP_SVG_HEIGHT}
        />
      </div>
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
