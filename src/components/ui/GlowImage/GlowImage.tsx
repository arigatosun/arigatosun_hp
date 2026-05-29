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
  /** グローを形の内側だけにクリップするマスク。null ならクリップなし */
  mask?: ServiceConceptMask | null;
  /** 画像の上に重ねるテキストオーバーレイ */
  overlays?: ServiceImageOverlay[];
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
  mask = null,
  overlays = [],
  glowOverrides,
}: GlowImageProps) {
  // マスク画像（形のシルエット）でグロー層をクリップする
  const clipStyle: CSSProperties | undefined = mask
    ? {
        maskImage: `url(${mask.src})`,
        WebkitMaskImage: `url(${mask.src})`,
        maskSize: mask.size,
        WebkitMaskSize: mask.size,
        maskPosition: mask.position,
        WebkitMaskPosition: mask.position,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }
    : undefined;

  const slimeProps = { ...SLIME_GLOW_STANDARD, ...glowOverrides };

  return (
    <div
      className={styles.wrap}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={styles.image}
          sizes="(max-width: 1023px) 92vw, 44vw"
        />
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
