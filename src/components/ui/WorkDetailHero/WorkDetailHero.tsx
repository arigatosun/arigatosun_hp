import Image from 'next/image';
import type { WorkHero } from '@/types/work';
import styles from './WorkDetailHero.module.scss';

// Figma ヒーロー基準サイズ（写真座標はこの座標系の px）
const HERO_W = 1920;
const HERO_H = 760;

type WorkDetailHeroProps = {
  hero: WorkHero;
};

export default function WorkDetailHero({ hero }: WorkDetailHeroProps) {
  return (
    <div className={styles.hero}>
      <div className={styles.band} aria-hidden="true" />

      <div className={styles.collage}>
        {hero.photos.map((photo, index) => (
          <div
            key={index}
            className={styles.photo}
            style={{
              left: `${(photo.x / HERO_W) * 100}%`,
              top: `${(photo.y / HERO_H) * 100}%`,
              width: `${(photo.width / HERO_W) * 100}%`,
              height: `${(photo.height / HERO_H) * 100}%`,
            }}
          >
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="(max-width: 1023px) 50vw, 30vw"
              className={styles.photoImg}
            />
          </div>
        ))}
      </div>

      {hero.logo && (
        <div className={styles.logo}>
          <span
            className={styles.logoWordmark}
            style={{ backgroundImage: `url('${hero.logo.wordmark}')` }}
          />
          <span
            className={styles.logoMark}
            style={{ backgroundImage: `url('${hero.logo.mark}')` }}
          />
        </div>
      )}
    </div>
  );
}
