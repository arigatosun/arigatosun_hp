import Image from 'next/image';
import styles from './WorkImageGrid.module.scss';

type WorkImageGridProps = {
  images: string[];
  imageRatio: { w: number; h: number };
  caption: string;
};

export default function WorkImageGrid({
  images,
  imageRatio,
  caption,
}: WorkImageGridProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.grid}>
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
