import Image from 'next/image';
import styles from './SectionHeader.module.scss';

type SectionHeaderLogo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type SectionHeaderProps = {
  /** 左側に表示するロゴ画像（任意） */
  logo?: SectionHeaderLogo;
  /** 大見出し（日本語） */
  title: string;
  /** 英語サブテキスト（任意） */
  subtitle?: string;
  /** 揃え方向 — デフォルト 'left' */
  align?: 'left' | 'center';
  /** 見出しタグ — デフォルト 'h2' */
  as?: 'h1' | 'h2' | 'h3';
  /** タイポサイズ — 'default' (24px) / 'service-detail' (28px / ls 11.2 / Medium) */
  size?: 'default' | 'service-detail';
  /** 親側で margin 等を上書きしたい場合に渡す */
  className?: string;
};

export default function SectionHeader({
  logo,
  title,
  subtitle,
  align = 'left',
  as: Tag = 'h2',
  size = 'default',
  className,
}: SectionHeaderProps) {
  const rootClass = [
    styles.header,
    align === 'center' ? styles.headerCenter : '',
    size === 'service-detail' ? styles.sizeServiceDetail : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      {logo && (
        <Image
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          className={styles.headerLogo}
        />
      )}
      <div className={styles.headerText}>
        <Tag
          className={[
            styles.headerTitle,
            // 複数行タイトル(\n 含む。例: CREATOR FIRST)は Figma leading に合わせ行間を広げる
            title.includes('\n') ? styles.headerTitleMultiline : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {title}
        </Tag>
        {subtitle && <p className={styles.headerSub}>{subtitle}</p>}
      </div>
    </div>
  );
}
