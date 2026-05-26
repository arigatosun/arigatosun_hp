import Image from 'next/image';
import Link from 'next/link';
import type { ServiceCardData } from '@/types/service';
import styles from './ServiceCard.module.scss';

type ServiceCardProps = {
  card: ServiceCardData;
};

export default function ServiceCard({ card }: ServiceCardProps) {
  return (
    <Link href={`/service/${card.id}`} className={styles.card} aria-label={`${card.title} の詳細を見る`}>
      {/* 背景: 動画 > 画像 > プレースホルダー の優先順 */}
      {card.bgVideo ? (
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
          {/* 下半分の黒色グラデーション（滑らかな暗化） */}
          <div className={styles.gradient} />
          {/* 細かいドット（ハーフトーン風）— 下に行くほど密度が増す */}
          <div className={styles.dots} aria-hidden="true" />
        </>
      ) : card.bgImage ? (
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
    </Link>
  );
}
