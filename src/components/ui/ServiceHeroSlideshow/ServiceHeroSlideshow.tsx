'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './ServiceHeroSlideshow.module.scss';

export type ServiceHeroSlide = {
  src: string;
  alt: string;
};

type ServiceHeroSlideshowProps = {
  slides: ServiceHeroSlide[];
  /** 自動再生ミリ秒。0/未指定なら自動再生しない */
  autoplayMs?: number;
};

/**
 * IP/CREATIVE Hero の差分: 単一画像ではなく 5 枚を切り替えるスライドショー。
 * - フェード遷移（opacity）
 * - 左右ボタン + ドットインジケーターで手動切替
 * - autoplayMs 指定時は自動で次のスライドへ。ユーザー操作後は一時停止しない（要望出たら追加）
 */
export default function ServiceHeroSlideshow({
  slides,
  autoplayMs = 5000,
}: ServiceHeroSlideshowProps) {
  const [index, setIndex] = useState(0);
  const total = slides.length;
  const timerRef = useRef<number | null>(null);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % total) + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // 自動再生（インデックス変化のたびに再スケジュール）
  useEffect(() => {
    if (!autoplayMs || total <= 1) return;
    timerRef.current = window.setTimeout(() => {
      goTo(index + 1);
    }, autoplayMs);
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [index, autoplayMs, total, goTo]);

  if (total === 0) return null;

  return (
    <div
      className={styles.root}
      role="region"
      aria-roledescription="カルーセル"
      aria-label="IP/CREATIVE のメイン画像"
    >
      <div className={styles.viewport}>
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`${styles.slide} ${i === index ? styles.slideActive : ''}`}
            aria-hidden={i === index ? undefined : true}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              width={1520}
              height={800}
              className={styles.image}
              priority={i === 0}
              sizes="(max-width: 1520px) 100vw, 1520px"
            />
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrev}`}
            onClick={prev}
            aria-label="前の画像"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            onClick={next}
            aria-label="次の画像"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
