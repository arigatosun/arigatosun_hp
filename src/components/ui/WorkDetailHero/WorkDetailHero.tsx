import Image from 'next/image';
import type { WorkHero, WorkHeroPhoto } from '@/types/work';
import styles from './WorkDetailHero.module.scss';

const DEFAULT_PC_W = 1920;
const DEFAULT_PC_H = 760;
const DEFAULT_SP_W = 390;
const DEFAULT_SP_H = 540;
// SP ビューポート基準幅（spWidth が これより広い場合は overflow 設計と見なし、内側コラージュを中央寄せでオーバーフローさせる）
const SP_VIEWPORT_W = 390;

type WorkDetailHeroProps = {
  hero: WorkHero;
};

type CollageProps = {
  photos: WorkHeroPhoto[];
  frameW: number;
  frameH: number;
  variant: 'pc' | 'sp';
};

function Collage({ photos, frameW, frameH, variant }: CollageProps) {
  return (
    <div className={styles.collage}>
      {photos.map((photo, index) => {
        const rect =
          variant === 'sp' && photo.sp
            ? photo.sp
            : { x: photo.x, y: photo.y, width: photo.width, height: photo.height };
        const widthVw = Math.min(100, Math.round((rect.width / frameW) * 100));
        return (
          <div
            key={index}
            className={styles.photo}
            style={{
              left: `${(rect.x / frameW) * 100}%`,
              top: `${(rect.y / frameH) * 100}%`,
              width: `${(rect.width / frameW) * 100}%`,
              height: `${(rect.height / frameH) * 100}%`,
            }}
          >
            {photo.src ? (
              <Image
                src={photo.src}
                alt=""
                fill
                sizes={`(max-width: 1023px) ${Math.min(100, widthVw + 20)}vw, ${widthVw}vw`}
                className={styles.photoImg}
              />
            ) : (
              <div className={styles.placeholder} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function WorkDetailHero({ hero }: WorkDetailHeroProps) {
  const pcW = hero.width ?? DEFAULT_PC_W;
  const pcH = hero.height ?? DEFAULT_PC_H;
  const spW = hero.spWidth ?? DEFAULT_SP_W;
  const spH = hero.spHeight ?? DEFAULT_SP_H;
  const band = hero.band ?? 'pink';
  // SP ヒーロー要素自体はビューポート (390) 基準のアスペクト比、内側コラージュは spW/390 倍の幅で中央寄せ
  const spOverflow = spW > SP_VIEWPORT_W;
  const innerWidth = spOverflow ? `${(spW / SP_VIEWPORT_W) * 100}%` : '100%';

  const Logo = hero.logo ? (
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
  ) : null;

  return (
    <>
      <div
        className={`${styles.hero} ${styles.heroPc}`}
        style={{
          aspectRatio: `${pcW} / ${pcH}`,
          // pcWidthPct 指定時は右寄せで縮小（右端固定・左端を内側へ）
          ...(hero.pcWidthPct
            ? { width: `${hero.pcWidthPct}%`, marginLeft: 'auto' }
            : {}),
        }}
      >
        {band !== 'none' && <div className={styles.band} aria-hidden="true" />}
        <Collage photos={hero.photos} frameW={pcW} frameH={pcH} variant="pc" />
        {Logo}
      </div>

      <div
        className={`${styles.hero} ${styles.heroSp} ${
          hero.spFlatPhoto ? styles.heroSpFlat : ''
        }`}
        style={{
          aspectRatio: `${SP_VIEWPORT_W} / ${spH}`,
          marginTop: hero.spOffsetTop ? `${hero.spOffsetTop}px` : undefined,
        }}
      >
        {band !== 'none' && <div className={styles.band} aria-hidden="true" />}
        <div className={styles.heroSpInner} style={{ width: innerWidth }}>
          <Collage
            // spPhotos が指定されていればそれを使う。各 photo の x/y/w/h をそのまま座標として扱うため variant='pc' で呼ぶ
            photos={hero.spPhotos ?? hero.photos}
            frameW={spW}
            frameH={spH}
            variant={hero.spPhotos ? 'pc' : 'sp'}
          />
        </div>
        {hero.spLogo === false ? null : Logo}
      </div>
    </>
  );
}
