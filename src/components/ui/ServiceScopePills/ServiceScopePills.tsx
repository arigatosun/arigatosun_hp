'use client';

import { useEffect, useRef, useState } from 'react';
import SlimeGlow from '@/components/ui/SlimeGlow';
import { useMediaQuery } from '@/lib/useMediaQuery';
import type { ServicePillRow } from '@/types/service';
import styles from './ServiceScopePills.module.scss';

type ServiceScopePillsProps = {
  rows: ServicePillRow[];
};

type OverlayRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  mask: string;
};

const PILLS_GLOW_PROPS = {
  color: '#DA2719',
  radiusRatio: 0.45,
  subBlobCount: 7,
  maxOpacity: 0.28,
  followSpeed: 0.04,
  cursorBlend: 0.85,
  releaseMs: 800,
  driftSpeed: 0.00028,
  coreBoost: 1.4,
  gradientFalloff: 2.0,
  intensityVariance: 0.55,
  breathSpeed: 0.0006,
  breathAmount: 0.22,
};

/**
 * 能動的デザインの領域セクションのピルリスト。
 * ピル列全体を覆う 1 つの SlimeGlow を、5 つのピル形状でマスククリップして表示する。
 * - スライムはピル列全体 (約 188×300px) のキャンバスを自律ドリフト + 呼吸 + カーソル追従
 * - 各ピルは「窓」として機能し、スライムが通過した瞬間にそのピル内で見える
 * - 768px 未満 (SP) は SlimeGlow を mount せず、accent ピルに静的赤グラデのフォールバック
 */
export default function ServiceScopePills({ rows }: ServiceScopePillsProps) {
  const isPC = useMediaQuery('(min-width: 768px)');
  const containerRef = useRef<HTMLDivElement>(null);
  const [overlayRect, setOverlayRect] = useState<OverlayRect | null>(null);

  useEffect(() => {
    if (!isPC) return;
    const container = containerRef.current;
    if (!container) return;

    function update() {
      const c = containerRef.current;
      if (!c) return;
      const cRect = c.getBoundingClientRect();
      const pills = c.querySelectorAll<HTMLElement>('[data-pill]');
      if (pills.length === 0) return;
      const first = pills[0].getBoundingClientRect();
      const last = pills[pills.length - 1].getBoundingClientRect();
      const left = first.left - cRect.left;
      const top = first.top - cRect.top;
      const width = first.width;
      const height = last.top + last.height - first.top;
      if (width <= 0 || height <= 0) return;

      // 各ピルの相対位置で角丸 rect を並べた SVG マスクを生成
      let rects = '';
      pills.forEach((p) => {
        const r = p.getBoundingClientRect();
        const x = r.left - cRect.left - left;
        const y = r.top - cRect.top - top;
        const rx = r.height / 2;
        rects += `<rect x="${x}" y="${y}" width="${r.width}" height="${r.height}" rx="${rx}" ry="${rx}" fill="white" />`;
      });
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>${rects}</svg>`;
      const mask = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

      setOverlayRect({ left, top, width, height, mask });
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [isPC]);

  return (
    <div ref={containerRef} className={styles.container}>
      {isPC && overlayRect && (
        <div
          className={styles.slimeOverlay}
          style={{
            left: overlayRect.left,
            top: overlayRect.top,
            width: overlayRect.width,
            height: overlayRect.height,
            maskImage: overlayRect.mask,
            WebkitMaskImage: overlayRect.mask,
          }}
          aria-hidden="true"
        >
          <SlimeGlow {...PILLS_GLOW_PROPS} />
        </div>
      )}
      <ul className={styles.list}>
        {rows.map((row) => (
          <li key={row.label} className={styles.row}>
            <span
              data-pill
              className={`${styles.pill} ${row.accent ? styles.pillAccent : ''}`}
            >
              <span className={styles.label}>{row.label}</span>
            </span>
            <span className={styles.items}>{row.items}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
