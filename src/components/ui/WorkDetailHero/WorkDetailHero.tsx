import Image from 'next/image';
import type { WorkHero } from '@/types/work';
import styles from './WorkDetailHero.module.scss';

// Figma ヒーロー基準サイズのデフォルト（個別ページで width/height で上書き可）
const DEFAULT_HERO_W = 1920;
const DEFAULT_HERO_H = 760;

type WorkDetailHeroProps = {
  hero: WorkHero;
};

export default function WorkDetailHero({ hero }: WorkDetailHeroProps) {
  const HERO_W = hero.width ?? DEFAULT_HERO_W;
  const HERO_H = hero.height ?? DEFAULT_HERO_H;
  const band = hero.band ?? 'pink';

  return (
    <div
      className={styles.hero}
      style={{ aspectRatio: `${HERO_W} / ${HERO_H}` }}
    >
      {band !== 'none' && <div className={styles.band} aria-hidden="true" />}

      <div className={styles.collage}>
        {hero.photos.map((photo, index) => {
          // 写真がヒーロー幅に対して占める割合を sizes に反映（フル幅 1 枚画像も適切に最適化されるよう）
          const widthVw = Math.min(100, Math.round((photo.width / HERO_W) * 100));
          return (
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
                sizes={`(max-width: 1023px) ${Math.min(100, widthVw + 20)}vw, ${widthVw}vw`}
                className={styles.photoImg}
              />
            </div>
          );
        })}
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
