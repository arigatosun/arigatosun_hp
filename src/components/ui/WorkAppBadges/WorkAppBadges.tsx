import Image from 'next/image';
import styles from './WorkAppBadges.module.scss';

type WorkAppBadgesProps = {
  /** 横並びのストアバッジ。先頭から左→右に並ぶ。 */
  badges: { src: string; w: number; h: number; href: string; label: string }[];
};

/**
 * App Store / Google Play のストアバッジを横並びで配置するブロック。
 * PC: 左揃え（本文と左端を揃える） / SP: 中央揃え。各バッジは別タブで外部ストアへ遷移。
 * SVG バッジは next/image の最適化を通さず原本を配信するため unoptimized を付ける。
 */
export default function WorkAppBadges({ badges }: WorkAppBadgesProps) {
  return (
    <section className={styles.section}>
      <div className={styles.row}>
        {badges.map((badge) => (
          <a
            key={badge.href}
            className={styles.badge}
            href={badge.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={badge.label}
          >
            <Image
              src={badge.src}
              alt={badge.label}
              width={badge.w}
              height={badge.h}
              className={styles.badgeImg}
              unoptimized={badge.src.endsWith('.svg')}
            />
          </a>
        ))}
      </div>
    </section>
  );
}
