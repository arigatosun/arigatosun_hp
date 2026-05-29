import Image from 'next/image';
import type { WorkNamingRow } from '@/types/work';
import styles from './WorkNamingCard.module.scss';

type WorkNamingCardProps = {
  rows: WorkNamingRow[];
  spImage?: { src: string; w: number; h: number };
};

export default function WorkNamingCard({ rows, spImage }: WorkNamingCardProps) {
  return (
    <div className={styles.wrap}>
      {/* PC: 既存の白カード + 2 行 (ラベル + ロゴ) */}
      <div className={`${styles.card} ${styles.cardPc}`}>
        {rows.map((row, index) => (
          <div key={index} className={styles.row}>
            <div className={styles.labels}>
              <p className={styles.label}>{row.label}</p>
              <p className={styles.note}>{row.note}</p>
            </div>
            <span
              className={styles.visualLogo}
              style={{
                aspectRatio: `${row.visual.w} / ${row.visual.h}`,
                backgroundImage: `url('${row.visual.src}')`,
              }}
            />
          </div>
        ))}
      </div>

      {/* SP: spImage 指定時は 1 枚画像で full-bleed 表示 */}
      {spImage && (
        <div
          className={styles.cardSpImage}
          style={{ aspectRatio: `${spImage.w} / ${spImage.h}` }}
        >
          <Image
            src={spImage.src}
            alt=""
            fill
            sizes="(max-width: 1023px) 100vw, 0px"
            className={styles.cardSpImageInner}
          />
        </div>
      )}
    </div>
  );
}
