import styles from './WorkShowcaseCard.module.scss';

type WorkShowcaseCardProps = {
  background: 'white' | 'pink';
  card: { w: number; h: number };
  graphic: { src: string; w: number; h: number };
};

export default function WorkShowcaseCard({
  background,
  card,
  graphic,
}: WorkShowcaseCardProps) {
  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.card} ${
          background === 'pink' ? styles.pink : styles.white
        }`}
        style={{ aspectRatio: `${card.w} / ${card.h}` }}
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
