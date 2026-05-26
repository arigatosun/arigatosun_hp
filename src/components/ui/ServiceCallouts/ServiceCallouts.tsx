import GlowImage from '@/components/ui/GlowImage';
import type {
  ServiceCalloutItem,
  ServiceConceptMask,
} from '@/types/service';
import styles from './ServiceCallouts.module.scss';

type ServiceCalloutsProps = {
  items: ServiceCalloutItem[];
  /** 背景の線画 + 赤グロー（任意） */
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    mask: ServiceConceptMask | null;
  };
};

/**
 * STANDARD セクションの右側に置く 3 つの判断軸カード。
 * Figma 上では 3 callouts が三角形状に配置されている：
 *   - 上中央寄り: 個性の純度
 *   - 中左:     持続の設計
 *   - 下右:     熱狂の深度
 * PC ではこの三角配置を再現、SP では縦積み。
 */
export default function ServiceCallouts({ items, image }: ServiceCalloutsProps) {
  return (
    <div
      className={styles.root}
      style={
        image
          ? { aspectRatio: `${image.width} / ${image.height}` }
          : undefined
      }
    >
      {image && (
        <div className={styles.bg}>
          <GlowImage
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            mask={image.mask}
          />
        </div>
      )}
      {items.map((item, i) => (
        <div
          key={i}
          className={`${styles.item} ${styles[`pos${i + 1}`]}`}
        >
          <p className={styles.label}>{item.label}</p>
          <p className={styles.body}>
            {item.body.split('\n').map((line, j) => (
              <span key={j} className={styles.line}>
                {line}
              </span>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
}
