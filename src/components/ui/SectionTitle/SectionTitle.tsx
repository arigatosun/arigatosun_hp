import Image from 'next/image';
import styles from './SectionTitle.module.scss';

type SectionTitleProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  label?: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
};

export default function SectionTitle({
  src,
  alt,
  width,
  height,
  label,
  as: Tag = 'h2',
  className,
}: SectionTitleProps) {
  return (
    <div className={`${styles.wrapper} ${className || ''}`}>
      <Tag className={styles.titleLogo}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={styles.titleLogoImage}
        />
      </Tag>
      {label && <p className={styles.label}>{label}</p>}
    </div>
  );
}
