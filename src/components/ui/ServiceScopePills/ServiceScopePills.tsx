'use client';

import { useCallback, useRef } from 'react';
import { useMediaQuery } from '@/lib/useMediaQuery';
import type { ServicePillRow } from '@/types/service';
import styles from './ServiceScopePills.module.scss';

type ServiceScopePillsProps = {
  rows: ServicePillRow[];
};

/**
 * 能動的デザインの領域セクションのピルリスト（5行）。
 * カーソルに追従して赤グローが移動。グローは各ピルの角丸でクリップされる（マスク表示）。
 * 768px 未満はカーソル追従を無効化（既定位置のまま）。
 */
export default function ServiceScopePills({ rows }: ServiceScopePillsProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const frameRef = useRef(0);
  const isPC = useMediaQuery('(min-width: 768px)');

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLUListElement>) => {
      const x = e.clientX;
      const y = e.clientY;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        listRef.current
          ?.querySelectorAll<HTMLElement>(`.${styles.pill}`)
          .forEach((pill) => {
            const rect = pill.getBoundingClientRect();
            pill.style.setProperty('--gx', `${x - rect.left}px`);
            pill.style.setProperty('--gy', `${y - rect.top}px`);
          });
      });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    listRef.current
      ?.querySelectorAll<HTMLElement>(`.${styles.pill}`)
      .forEach((pill) => {
        pill.style.removeProperty('--gx');
        pill.style.removeProperty('--gy');
      });
  }, []);

  return (
    <ul
      ref={listRef}
      className={styles.list}
      onMouseMove={isPC ? handleMouseMove : undefined}
      onMouseLeave={isPC ? handleMouseLeave : undefined}
    >
      {rows.map((row) => (
        <li key={row.label} className={styles.row}>
          <span
            className={`${styles.pill} ${row.accent ? styles.pillAccent : ''}`}
          >
            {row.label}
          </span>
          <span className={styles.items}>{row.items}</span>
        </li>
      ))}
    </ul>
  );
}
