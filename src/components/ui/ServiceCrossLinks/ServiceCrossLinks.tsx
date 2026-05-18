import Link from 'next/link';
import type { ServiceNavItem } from '@/types/service';
import styles from './ServiceCrossLinks.module.scss';

type ServiceCrossLinksProps = {
  /** 表示する他サービス（現在ページを除いた2件） */
  items: ServiceNavItem[];
};

/** 他サービスへの誘導カード（2枚） */
export default function ServiceCrossLinks({ items }: ServiceCrossLinksProps) {
  return (
    <nav className={styles.crossLinks} aria-label="他のサービス">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`/service/${item.slug}`}
          className={styles.card}
        >
          <span className={styles.label}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
