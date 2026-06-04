'use client';

import { type CSSProperties, type ComponentProps } from 'react';
import Image from 'next/image';
import SlimeGlow, { SLIME_GLOW_STANDARD } from '@/components/ui/SlimeGlow';
import type { ServiceConceptMask, ServiceImageOverlay } from '@/types/service';
import styles from './GlowImage.module.scss';

type GlowImageProps = {
  /** 線画イラスト画像。未用意なら null（プレースホルダー表示） */
  src: string | null;
  alt: string;
  width: number;
  height: number;
  /** SP 専用画像。指定時は PC=src / SP=spSrc を CSS で出し分ける（アスペクトはほぼ同一前提）。 */
  spSrc?: string;
  spWidth?: number;
  spHeight?: number;
  /** グローを形の内側だけにクリップするマスク（PC / 既定）。null ならクリップなし */
  mask?: ServiceConceptMask | null;
  /**
   * SP 専用マスク。PC=mask / SP=spMask を CSS で出し分ける（PC/SP で図のレイアウトが
   * 別組みでマスク形状が異なるケース用）。未指定なら mask を SP でも流用する。
   */
  spMask?: ServiceConceptMask | null;
  /** 画像の上に重ねるテキストオーバーレイ */
  overlays?: ServiceImageOverlay[];
  /** SP で全幅(+44px)拡大をやめ、ネイティブ width で頭打ち＋中央寄せにする */
  compactSp?: boolean;
  /**
   * SlimeGlow の追加上書きパラメータ。
   * 既定は SLIME_GLOW_STANDARD (サービスページ「アリガトサン・スタンダード」と同じ見た目)。
   * このオブジェクトで一部のキーだけ渡すと、プリセットにマージされる。
   *
   * @example
   *   <GlowImage src={...} mask={...} glowOverrides={{ color: '#FF8800' }} />
   */
  glowOverrides?: Partial<ComponentProps<typeof SlimeGlow>>;
};

/**
 * 線画イラスト + 不定形の赤いスライム状グロー。
 * PC / SP 共通で SlimeGlow Canvas を使用 (自律ドリフト + 呼吸モーフ + ポインタ追従/touch)。
 *
 * 構造:
 *   wrap (aspect-ratio = width/height)
 *     ├─ glowClip       z-index 1 (mask で形にクリップされたグロー層)
 *     │    └─ SlimeGlow canvas (blur 18px で 1 塊に溶け合った濃淡)
 *     ├─ image          z-index 2 (線画 + テキストの PNG)
 *     └─ overlays       z-index 3 (任意のテキストオーバーレイ)
 *
 * @example 基本（サービスページと同じ「ARIGATOSUN STANDARD」の見た目）:
 *   <GlowImage
 *     src="/images/sections/service/detail/concept-standard.png"
 *     alt="..."
 *     width={1376}
 *     height={1343}
 *     mask={{
 *       src: '/images/sections/service/detail/concept-standard-mask.png',
 *       size: '100% 100%',
 *       position: 'center',
 *     }}
 *   />
 *
 * @example 色だけ変えたい時:
 *   <GlowImage ... glowOverrides={{ color: '#0080FF' }} />
 *
 * @example 動きをもっと早くしたい時:
 *   <GlowImage ... glowOverrides={{ breathSpeed: 0.0005, driftSpeed: 0.0004 }} />
 */
export default function GlowImage({
  src,
  alt,
  width,
  height,
  spSrc,
  spWidth,
  spHeight,
  mask = null,
  spMask = null,
  overlays = [],
  compactSp = false,
  glowOverrides,
}: GlowImageProps) {
  // マスク画像（形のシルエット）でグロー層をクリップする。
  // PC=mask / SP=spMask を SCSS 側の @include sp で出し分けるため、ここでは
  // CSS 変数として値だけを注入する（mask-image 自体の適用は .glowClip の SCSS）。
  // spMask 未指定時は SP も PC マスクにフォールバック（SCSS の var フォールバック）。
  const clipVars: Record<string, string> = {};
  if (mask) {
    clipVars['--gi-mask'] = `url(${mask.src})`;
    clipVars['--gi-mask-size'] = mask.size;
    clipVars['--gi-mask-pos'] = mask.position;
  }
  if (spMask) {
    clipVars['--gi-mask-sp'] = `url(${spMask.src})`;
    clipVars['--gi-mask-sp-size'] = spMask.size;
    clipVars['--gi-mask-sp-pos'] = spMask.position;
  }
  const clipStyle = clipVars as CSSProperties;

  const slimeProps = { ...SLIME_GLOW_STANDARD, ...glowOverrides };

  return (
    <div
      className={`${styles.wrap} ${compactSp ? styles.compactSp : ''}`}
      style={
        {
          // aspect-ratio は PC=width/height。SP で別寸の画像(spWidth/spHeight)を出し分ける
          // 場合は SP 側で別アスペクトに切替（SCSS の @include sp）。これが無いと SP 画像が
          // PC アスペクトの枠にレターボックスされ、マスクとの間にズレが出る。
          '--gi-aspect': `${width} / ${height}`,
          ...(spWidth && spHeight
            ? { '--gi-aspect-sp': `${spWidth} / ${spHeight}` }
            : {}),
          // SP の頭打ち幅。.compactSp の SP ルールでのみ参照する（PC は無視＝全幅のまま）。
          // SP 別寸画像がある場合は SP のネイティブ幅(spWidth)を頭打ちにする（PC幅だと SP が拡大してしまう）。
          ...(compactSp ? { '--compact-max': `${spWidth ?? width}px` } : {}),
        } as CSSProperties
      }
    >
      {src ? (
        <>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`${styles.image} ${spSrc ? styles.imagePc : ''}`}
            sizes="(max-width: 1023px) 92vw, 44vw"
          />
          {spSrc && (
            // SP 専用画像（PC では非表示）。PC=src / SP=spSrc の出し分け。
            <Image
              src={spSrc}
              alt=""
              aria-hidden="true"
              width={spWidth ?? width}
              height={spHeight ?? height}
              className={`${styles.image} ${styles.imageSp}`}
              sizes="92vw"
            />
          )}
        </>
      ) : (
        <div className={styles.placeholder} role="img" aria-label={alt} />
      )}
      <div className={styles.glowClip} style={clipStyle} aria-hidden="true">
        <SlimeGlow {...slimeProps} />
      </div>

      {overlays.length > 0 && (
        <div className={styles.overlays} aria-hidden="false">
          {overlays.map((o, i) => (
            <p
              key={i}
              className={styles.overlay}
              style={{
                top: `${o.topPct}%`,
                left: `${o.leftPct}%`,
                width: `${o.widthPct}%`,
              }}
            >
              {o.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
