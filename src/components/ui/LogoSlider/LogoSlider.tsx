'use client';

import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { LOGOS } from '@/data/logos';
import styles from './LogoSlider.module.scss';

export default function LogoSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  // 2セット配置でシームレスな無限ループを実現
  const items = [...LOGOS, ...LOGOS];

  // カーソル位置を CSS変数（--mx / --my）へ反映（rAF で間引き）
  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const rect = slider.getBoundingClientRect();
    posRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const reveal = revealRef.current;
      if (reveal) {
        reveal.style.setProperty('--mx', `${posRef.current.x}px`);
        reveal.style.setProperty('--my', `${posRef.current.y}px`);
      }
    });
  }, []);

  const handleEnter = useCallback(() => {
    revealRef.current?.classList.add(styles.active);
  }, []);

  const handleLeave = useCallback(() => {
    revealRef.current?.classList.remove(styles.active);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div
        ref={sliderRef}
        className={styles.slider}
        onMouseMove={handleMove}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {/* ベース層: グレースケール表示 */}
        <div className={styles.track}>
          {items.map((logo, index) => (
            <div key={`base-${logo.id}-${index}`} className={styles.logoItem}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={865}
                height={188}
                className={styles.logoImage}
              />
            </div>
          ))}
        </div>

        {/* カラー層: カーソル位置の放射状グラデーションでマスク表示 */}
        <div ref={revealRef} className={styles.reveal} aria-hidden="true">
          <div className={styles.track}>
            {items.map((logo, index) => (
              <div key={`color-${logo.id}-${index}`} className={styles.logoItem}>
                <Image
                  src={logo.colorSrc}
                  alt=""
                  width={636}
                  height={138}
                  className={styles.logoImageColor}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
