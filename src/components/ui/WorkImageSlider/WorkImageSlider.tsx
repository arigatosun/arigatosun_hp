'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './WorkImageSlider.module.scss';

type WorkImageSliderProps = {
  images: string[];
  alt: string;
  /** スライダー枠のアスペクト比（既定はアーカイブ用 '1520 / 480'）。縦長スライダーで上書き。 */
  aspectRatio?: string;
};

export default function WorkImageSlider({
  images,
  alt,
  aspectRatio,
}: WorkImageSliderProps) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  return (
    <div className={styles.band}>
      <div
        className={styles.frame}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <Image
          src={images[index]}
          alt={alt}
          fill
          sizes="(max-width: 1023px) 100vw, 1520px"
          className={styles.image}
        />
        <button
          type="button"
          className={styles.arrowPrev}
          onClick={prev}
          aria-label="前の画像"
        >
          <span className={styles.arrowIcon} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={styles.arrowNext}
          onClick={next}
          aria-label="次の画像"
        >
          <span className={styles.arrowIcon} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
