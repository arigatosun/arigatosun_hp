'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './WorkImageSlider.module.scss';

type WorkImageSliderProps = {
  images: string[];
  alt: string;
};

export default function WorkImageSlider({
  images,
  alt,
}: WorkImageSliderProps) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  return (
    <div className={styles.band}>
      <div className={styles.frame}>
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
