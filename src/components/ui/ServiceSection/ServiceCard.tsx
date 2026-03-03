import Image from 'next/image';
import styles from './ServiceCard.module.scss';

export type ServiceCardData = {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  description: string;
  viewLabel: string;
  bgImage: string;
};

type ServiceCardProps = {
  card: ServiceCardData;
};

export default function ServiceCard({ card }: ServiceCardProps) {
  return (
    <div className={styles.card}>
      {/* 背景画像 */}
      <Image
        src={card.bgImage}
        alt={card.title}
        width={630}
        height={860}
        className={styles.bgImage}
      />

      {/* オーバーレイ画像 */}
      <Image
        src="/images/top/overlay.png"
        alt=""
        width={630}
        height={860}
        className={styles.overlay}
        aria-hidden="true"
      />

      {/* グラデーションオーバーレイ */}
      <div className={styles.gradient} />

      {/* カード内コンテンツ */}
      <div className={styles.content}>
        {/* VIEW ボタン（カード上部・赤背景） */}
        <div className={styles.viewButton}>
          <span className={styles.viewButtonLine}>VIEW</span>
          <span className={styles.viewButtonLine}>{card.title} &gt;</span>
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
