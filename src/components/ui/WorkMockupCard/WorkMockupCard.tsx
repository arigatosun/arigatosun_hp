import Image from 'next/image';
import styles from './WorkMockupCard.module.scss';

type WorkMockupCardProps = {
  src: string;
  w: number;
  h: number;
};

export default function WorkMockupCard({ src, w, h }: WorkMockupCardProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card} style={{ aspectRatio: `${w} / ${h}` }}>
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 1023px) 92vw, 1520px"
          className={styles.image}
        />
      </div>
    </div>
  );
}
