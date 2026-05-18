import Link from 'next/link';
import { SERVICE_CARDS } from '@/data/services';
import styles from './ServiceCardGrid.module.scss';

export default function ServiceCardGrid() {
  return (
    <section className={styles.section} aria-label="サービス一覧">
      <div className={styles.cards}>
        {SERVICE_CARDS.map((card) => (
          <Link
            key={card.id}
            href={`/service/${card.id}`}
            className={styles.card}
          >
            <div className={styles.cardBody}>
              <p className={styles.cardLabel}>{card.categoryLabel}</p>
              <h2 className={styles.cardTitle}>{card.title}</h2>
              <p className={styles.cardDesc}>{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
