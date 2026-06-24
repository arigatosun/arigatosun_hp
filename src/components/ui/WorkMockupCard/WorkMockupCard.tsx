import Image from 'next/image';
import WorkImageSlider from '@/components/ui/WorkImageSlider';
import styles from './WorkMockupCard.module.scss';

type SpVariant = 'pairStacked' | 'pairSplit2' | 'variations11' | 'placeholder';

type WorkMockupCardProps = {
  src: string;
  w: number;
  h: number;
  /** PC カードの最大幅（Figma 実測 px・1920 基準）。指定時のみ左寄せで max-width 固定。 */
  width?: number;
  sp?: {
    variant: SpVariant;
    spAspectRatio?: string;
  };
  spSrc?: string;
  spW?: number;
  spH?: number;
  spFullBleed?: boolean;
  spCaption?: string;
  spSlider?: string[];
  spSliderAspect?: string;
};

/**
 * SP 専用プレースホルダー（src を使わずグレー枠で描画）。
 * 画像が後追いになる NEST 用に variant 別レイアウトを提供する。
 */
function SpPlaceholder({
  variant,
  aspectRatio,
}: {
  variant: SpVariant;
  aspectRatio?: string;
}) {
  if (variant === 'pairStacked') {
    return (
      <div
        className={`${styles.spPair} ${styles.spPairStacked}`}
        style={{ aspectRatio: aspectRatio ?? '390 / 400' }}
      >
        <div className={`${styles.spPairCell} ${styles.spPairCellWhite}`} />
        <div className={`${styles.spPairCell} ${styles.spPairCellDark}`} />
      </div>
    );
  }
  if (variant === 'pairSplit2') {
    return (
      <div
        className={`${styles.spPair} ${styles.spPairSplit2}`}
        style={{ aspectRatio: aspectRatio ?? '390 / 380' }}
      >
        <div className={`${styles.spPairCell} ${styles.spPairCellWhite}`} />
        <div className={`${styles.spPairCell} ${styles.spPairCellDark}`} />
      </div>
    );
  }
  if (variant === 'variations11') {
    return (
      <div
        className={styles.spVariations11}
        style={{ aspectRatio: aspectRatio ?? '391 / 293' }}
      >
        {/* 3+4+4 のタイルグリッド（Figma Group 916 準拠） */}
        <div className={styles.spVariations11Row3}>
          <div className={styles.spVariations11Tile} />
          <div className={styles.spVariations11Tile} />
          <div className={styles.spVariations11Tile} />
        </div>
        <div className={styles.spVariations11Row4}>
          <div className={styles.spVariations11Tile} />
          <div className={styles.spVariations11Tile} />
          <div className={styles.spVariations11Tile} />
          <div className={styles.spVariations11Tile} />
        </div>
        <div className={styles.spVariations11Row4}>
          <div className={styles.spVariations11Tile} />
          <div className={styles.spVariations11Tile} />
          <div className={styles.spVariations11Tile} />
          <div className={styles.spVariations11Tile} />
        </div>
      </div>
    );
  }
  // placeholder（単一カード）
  return (
    <div
      className={styles.spSinglePlaceholder}
      style={{ aspectRatio: aspectRatio ?? '390 / 220' }}
    />
  );
}

export default function WorkMockupCard({
  src,
  w,
  h,
  width,
  sp,
  spSrc,
  spW,
  spH,
  spFullBleed = false,
  spCaption,
  spSlider,
  spSliderAspect,
}: WorkMockupCardProps) {
  const spImageSrc = spSrc ?? src;
  const spRatioW = spW ?? w;
  const spRatioH = spH ?? h;
  return (
    <div
      className={`${styles.wrap} ${spFullBleed ? styles.wrapFullBleed : ''}`}
    >
      {/* PC: 画像カード。src 未指定時はサイズ確保のプレースホルダー（画像は後追い） */}
      <div
        className={styles.cardPc}
        style={{
          aspectRatio: `${w} / ${h}`,
          // width 指定時は左寄せで max-width 固定（Figma 実測幅・1920 基準 clamp）。
          ...(width
            ? {
                maxWidth: `clamp(${Math.round(width * 0.42)}px, ${(
                  width / 19.2
                ).toFixed(3)}vw, ${width}px)`,
                marginRight: 'auto',
              }
            : {}),
        }}
      >
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 1023px) 92vw, 1520px"
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder} aria-hidden="true" />
        )}
        {spCaption && (
          <span className={styles.spCaption}>{spCaption}</span>
        )}
      </div>

      {/* SP: spSlider 指定時は ‹ › スライダー、sp 指定時は variant プレースホルダー、それ以外は単一画像 */}
      {spSlider && spSlider.length > 0 ? (
        <div className={styles.cardSpSlider}>
          <WorkImageSlider images={spSlider} alt="" aspectRatio={spSliderAspect} />
        </div>
      ) : sp ? (
        <div className={styles.cardSp}>
          <SpPlaceholder variant={sp.variant} aspectRatio={sp.spAspectRatio} />
        </div>
      ) : (
        <div
          className={styles.cardSpDefault}
          style={{ aspectRatio: `${spRatioW} / ${spRatioH}` }}
        >
          {spImageSrc ? (
            <Image
              src={spImageSrc}
              alt=""
              fill
              sizes="100vw"
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder} aria-hidden="true" />
          )}
          {spCaption && (
            <span className={styles.spCaption}>{spCaption}</span>
          )}
        </div>
      )}
    </div>
  );
}
