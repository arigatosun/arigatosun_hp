import type { WorkNamingRow } from '@/types/work';
import styles from './WorkNamingCard.module.scss';

type WorkNamingCardProps = {
  rows: WorkNamingRow[];
};

export default function WorkNamingCard({ rows }: WorkNamingCardProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
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
    </div>
  );
}
