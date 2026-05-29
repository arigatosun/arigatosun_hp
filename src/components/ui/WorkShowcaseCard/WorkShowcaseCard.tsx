import type { CSSProperties } from 'react';
import styles from './WorkShowcaseCard.module.scss';

type WorkShowcaseCardProps = {
  background: 'white' | 'pink';
  card: { w: number; h: number };
  spCard?: { w: number; h: number };
  graphic: { src: string; w: number; h: number };
};

export default function WorkShowcaseCard({
  background,
  card,
  spCard,
  graphic,
}: WorkShowcaseCardProps) {
  const cardStyle: CSSProperties = {
    ['--card-aspect' as string]: `${card.w} / ${card.h}`,
    ...(spCard && {
      ['--card-aspect-sp' as string]: `${spCard.w} / ${spCard.h}`,
    }),
  };
  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.card} ${
          background === 'pink' ? styles.pink : styles.white
        }`}
        style={cardStyle}
      >
        <span
          className={styles.graphic}
          style={{
            aspectRatio: `${graphic.w} / ${graphic.h}`,
            backgroundImage: `url('${graphic.src}')`,
          }}
        />
      </div>
    </div>
  );
}
