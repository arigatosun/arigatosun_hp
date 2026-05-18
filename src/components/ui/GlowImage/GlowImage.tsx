'use client';

import { useCallback, useRef } from 'react';
import Image from 'next/image';
import { useMediaQuery } from '@/lib/useMediaQuery';
import styles from './GlowImage.module.scss';

type GlowImageProps = {
  /** 線画イラスト画像。未用意なら null（プレースホルダー表示） */
  src: string | null;
  alt: string;
  width: number;
  height: number;
};

/**
 * 線画イラスト + カーソル追従の赤グロー。
 * BusinessStructureSection のヒートマップ方式を踏襲。
 * 768px 未満ではカーソル追従を無効化し、浮遊アニメのみ。
 */
export default function GlowImage({ src, alt, width, height }: GlowImageProps) {
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
      <div
        ref={glowRef}
        className={`${styles.glow} ${styles.floating}`}
        aria-hidden="true"
      />
    </div>
  );
}
