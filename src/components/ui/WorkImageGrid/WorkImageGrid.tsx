import type { CSSProperties } from 'react';
import Image from 'next/image';
import styles from './WorkImageGrid.module.scss';

type WorkImageGridProps = {
  images: string[];
  imageRatio: { w: number; h: number };
  caption: string;
  cardHeight: number;
  /** true の時、各サムネにブラーを適用（機密の提案資料用） */
  blur?: boolean;
  spImages?: string[];
  spImageRatio?: { w: number; h: number };
  spCardHeight?: number;
  spGridCols?: number;
  spBlur?: boolean;
};

export default function WorkImageGrid({
  images,
  imageRatio,
  caption,
  cardHeight,
  blur = false,
  spImages,
  spImageRatio,
  spCardHeight,
  spGridCols,
  spBlur = false,
}: WorkImageGridProps) {
  const hasSpVariant = !!spImages && spImages.length > 0;
  const spRatio = spImageRatio ?? imageRatio;
  const cardStyle: CSSProperties = {
    ['--card-mh' as string]: `clamp(${(cardHeight * 0.5).toFixed(0)}px, ${(
      cardHeight / 19.2
    ).toFixed(3)}vw, ${cardHeight}px)`,
    ...(spCardHeight !== undefined && {
      ['--card-mh-sp' as string]: `${spCardHeight}px`,
    }),
    ...(spGridCols !== undefined && {
      ['--sp-grid-cols' as string]: String(spGridCols),
    }),
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card} style={cardStyle}>
        <div
          className={`${styles.grid} ${images.length === 1 ? styles.gridSingle : ''} ${blur ? styles.blurred : ''} ${hasSpVariant ? styles.pcOnly : ''}`}
        >
          {images.map((src, index) => (
            <div
              key={index}
              className={styles.cell}
              style={{ aspectRatio: `${imageRatio.w} / ${imageRatio.h}` }}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes={
                  images.length === 1
                    ? '(max-width: 1023px) 100vw, 80vw'
                    : '(max-width: 1023px) 45vw, 22vw'
                }
                className={styles.image}
              />
            </div>
          ))}
        </div>
        {hasSpVariant && (
          <div
            className={`${styles.grid} ${spImages!.length === 1 ? styles.gridSingle : ''} ${spBlur ? styles.blurred : ''} ${styles.spOnly}`}
          >
            {spImages!.map((src, index) => (
              <div
                key={index}
                className={styles.cell}
                style={{ aspectRatio: `${spRatio.w} / ${spRatio.h}` }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes={
                    spImages!.length === 1
                      ? '(max-width: 1023px) 100vw, 80vw'
                      : '(max-width: 1023px) 24vw, 22vw'
                  }
                  className={styles.image}
                />
              </div>
            ))}
          </div>
        )}
        <p className={styles.caption}>{caption}</p>
      </div>
    </div>
  );
}
