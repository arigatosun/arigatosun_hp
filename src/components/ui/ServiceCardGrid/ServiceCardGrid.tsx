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
            {/* 背景動画 (TOP の ServiceCard と同仕様) */}
            {card.bgVideo && (
              <>
                <video
                  className={styles.bgVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={card.bgVideo.poster}
                  aria-hidden="true"
                >
                  <source src={card.bgVideo.webm} type="video/webm" />
                  <source src={card.bgVideo.mp4} type="video/mp4" />
                </video>
                <div className={styles.gradient} />
                <div className={styles.dots} aria-hidden="true" />
              </>
            )}
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
