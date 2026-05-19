import Image from 'next/image';
import type { ServiceCardData } from '@/types/service';
import styles from './ServiceCard.module.scss';

type ServiceCardProps = {
  card: ServiceCardData;
};

export default function ServiceCard({ card }: ServiceCardProps) {
  return (
    <div className={styles.card}>
      {/* 背景: 画像があれば写真＋オーバーレイ、なければグレープレースホルダー */}
      {card.bgImage ? (
        <>
          <Image
            src={card.bgImage}
            alt={card.title}
            width={612}
            height={748}
            className={styles.bgImage}
          />
          <Image
            src="/images/sections/service/card-overlay.png"
            alt=""
            width={612}
            height={748}
            className={styles.overlay}
            aria-hidden="true"
          />
          <div className={styles.gradient} />
        </>
      ) : (
        <div className={styles.placeholder} aria-hidden="true" />
      )}

      {/* カード内コンテンツ */}
      <div className={styles.content}>
        {/* VIEW マーカー（カード上部・各行に赤帯） */}
        <div className={styles.viewButton}>
          <span
            className={`${styles.viewButtonLine} ${styles.viewButtonLineTop}`}
          >
            <span className={styles.viewButtonText}>VIEW</span>
          </span>
          <span
            className={`${styles.viewButtonLine} ${styles.viewButtonLineBottom}`}
          >
            <span className={styles.viewButtonText}>{card.title} &gt;</span>
          </span>
        </div>

        {/* カード下部情報 */}
        <div className={styles.info}>
          <p className={styles.categoryLabel}>{card.categoryLabel}</p>
          <h3 className={styles.cardTitle}>{card.title}</h3>
          <p className={styles.cardDescription}>{card.description}</p>
        </div>
      </div>
    </div>
  );
}
