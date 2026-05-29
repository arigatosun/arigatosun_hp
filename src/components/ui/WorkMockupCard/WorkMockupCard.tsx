import Image from 'next/image';
import styles from './WorkMockupCard.module.scss';

type SpVariant = 'pairStacked' | 'pairSplit2' | 'variations11' | 'placeholder';

type WorkMockupCardProps = {
  src: string;
  w: number;
  h: number;
  sp?: {
    variant: SpVariant;
    spAspectRatio?: string;
  };
  spSrc?: string;
  spW?: number;
  spH?: number;
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
  sp,
  spSrc,
  spW,
  spH,
}: WorkMockupCardProps) {
  const spImageSrc = spSrc ?? src;
  const spRatioW = spW ?? w;
  const spRatioH = spH ?? h;
  return (
    <div className={styles.wrap}>
      {/* PC: 既存の画像カード */}
      <div className={styles.cardPc} style={{ aspectRatio: `${w} / ${h}` }}>
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 1023px) 92vw, 1520px"
          className={styles.image}
        />
      </div>

      {/* SP: sp が指定された場合は variant プレースホルダー、未指定は SP 画像（spSrc or src）カード */}
      {sp ? (
        <div className={styles.cardSp}>
          <SpPlaceholder variant={sp.variant} aspectRatio={sp.spAspectRatio} />
        </div>
      ) : (
        <div
          className={styles.cardSpDefault}
          style={{ aspectRatio: `${spRatioW} / ${spRatioH}` }}
        >
          <Image
            src={spImageSrc}
            alt=""
            fill
            sizes="100vw"
            className={styles.image}
          />
        </div>
      )}
    </div>
  );
}
