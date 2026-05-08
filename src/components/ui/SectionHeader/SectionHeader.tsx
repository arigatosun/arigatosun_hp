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
  /** 親側で margin 等を上書きしたい場合に渡す */
  className?: string;
};

export default function SectionHeader({
  logo,
  title,
  subtitle,
  align = 'left',
  as: Tag = 'h2',
  className,
}: SectionHeaderProps) {
  const rootClass = [
    styles.header,
    align === 'center' ? styles.headerCenter : '',
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
        <Tag className={styles.headerTitle}>{title}</Tag>
        {subtitle && <p className={styles.headerSub}>{subtitle}</p>}
      </div>
    </div>
  );
}
