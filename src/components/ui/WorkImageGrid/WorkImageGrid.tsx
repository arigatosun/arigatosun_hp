import Image from 'next/image';
import styles from './WorkImageGrid.module.scss';

type WorkImageGridProps = {
  images: string[];
  imageRatio: { w: number; h: number };
  caption: string;
  cardHeight: number;
  /** true の時、各サムネにブラーを適用（機密の提案資料用） */
  blur?: boolean;
};

export default function WorkImageGrid({
  images,
  imageRatio,
  caption,
  cardHeight,
  blur = false,
}: WorkImageGridProps) {
  return (
    <div className={styles.wrap}>
      <div
        className={styles.card}
        style={{
          minHeight: `clamp(${(cardHeight * 0.5).toFixed(0)}px, ${(
            cardHeight / 19.2
          ).toFixed(3)}vw, ${cardHeight}px)`,
        }}
      >
        <div className={blur ? `${styles.grid} ${styles.blurred}` : styles.grid}>
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
                sizes="(max-width: 1023px) 45vw, 22vw"
                className={styles.image}
              />
            </div>
          ))}
        </div>
        <p className={styles.caption}>{caption}</p>
      </div>
    </div>
  );
}
