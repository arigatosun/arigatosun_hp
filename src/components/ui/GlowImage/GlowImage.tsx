'use client';

import { useCallback, useRef, type CSSProperties } from 'react';
import Image from 'next/image';
import { useMediaQuery } from '@/lib/useMediaQuery';
import type { ServiceConceptMask, ServiceImageOverlay } from '@/types/service';
import styles from './GlowImage.module.scss';

type GlowImageProps = {
  /** 線画イラスト画像。未用意なら null（プレースホルダー表示） */
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /** グローを形の内側だけにクリップするマスク。null ならクリップなし */
  mask?: ServiceConceptMask | null;
  /** 画像の上に重ねるテキストオーバーレイ */
  overlays?: ServiceImageOverlay[];
};

/**
 * 線画イラスト + カーソル追従の赤グロー。
 * mask を渡すと、グローはその形（雲・泡など）の内側だけに表示される。
 * 768px 未満ではカーソル追従を無効化し、浮遊アニメのみ。
 */
export default function GlowImage({
  src,
  alt,
  width,
  height,
  mask = null,
  overlays = [],
}: GlowImageProps) {
  const glowRef = useRef<HTMLDivElement>(null);
  const isPC = useMediaQuery('(min-width: 768px)');

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const glow = glowRef.current;
    if (glow) {
      glow.style.left = `${x}%`;
      glow.style.top = `${y}%`;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    const glow = glowRef.current;
    if (glow) {
      glow.classList.remove(styles.floating);
      glow.classList.add(styles.hovering);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const glow = glowRef.current;
    if (glow) {
      glow.classList.remove(styles.hovering);
      glow.classList.add(styles.floating);
      glow.style.removeProperty('left');
      glow.style.removeProperty('top');
    }
  }, []);

  // マスク画像（形のシルエット）でグロー層をクリップする
  const clipStyle: CSSProperties | undefined = mask
    ? {
        maskImage: `url(${mask.src})`,
        WebkitMaskImage: `url(${mask.src})`,
        maskSize: mask.size,
        WebkitMaskSize: mask.size,
        maskPosition: mask.position,
        WebkitMaskPosition: mask.position,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }
    : undefined;

  return (
    <div
      className={styles.wrap}
      style={{ aspectRatio: `${width} / ${height}` }}
      onMouseMove={isPC ? handleMouseMove : undefined}
      onMouseEnter={isPC ? handleMouseEnter : undefined}
      onMouseLeave={isPC ? handleMouseLeave : undefined}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={styles.image}
        />
      ) : (
        <div className={styles.placeholder} role="img" aria-label={alt} />
      )}
      <div className={styles.glowClip} style={clipStyle} aria-hidden="true">
        <div ref={glowRef} className={`${styles.glow} ${styles.floating}`} />
      </div>

      {overlays.length > 0 && (
        <div className={styles.overlays} aria-hidden="false">
          {overlays.map((o, i) => (
            <p
              key={i}
              className={styles.overlay}
              style={{
                top: `${o.topPct}%`,
                left: `${o.leftPct}%`,
                width: `${o.widthPct}%`,
              }}
            >
              {o.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
