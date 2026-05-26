import Link from 'next/link';
import Image from 'next/image';
import type { ServiceNavItem } from '@/types/service';
import { SERVICE_DETAIL } from '@/data/service-detail';
import styles from './ServiceCrossLinks.module.scss';

type ServiceCrossLinksProps = {
  /** 表示する他サービス（現在ページを除いた2件） */
  items: ServiceNavItem[];
};

// slug → 背景画像（Figma Group 1170 / 1171 / 1172）
const BG_BY_SLUG: Record<string, string> = {
  'ai-dev': '/images/sections/service/detail/cross-link-ai-dev.png',
  'design-branding':
    '/images/sections/service/detail/cross-link-design-branding.png',
  'ip-creative': '/images/sections/service/detail/cross-link-ip-creative.png',
};

/** 他サービスへの誘導カード（2枚） */
export default function ServiceCrossLinks({ items }: ServiceCrossLinksProps) {
  return (
    <nav className={styles.crossLinks} aria-label="他のサービス">
      {items.map((item) => {
        const detail = SERVICE_DETAIL[item.slug];
        const labelJa = detail?.titleJa ?? '';
        const bg = BG_BY_SLUG[item.slug];
        return (
          <Link
            key={item.slug}
            href={`/service/${item.slug}`}
            className={styles.card}
          >
            {bg && (
              <Image
                src={bg}
                alt=""
                width={1440}
                height={800}
                className={styles.cardImage}
                aria-hidden="true"
              />
            )}
            <span className={styles.cardOverlay} aria-hidden="true" />
            <div className={styles.cardText}>
              {labelJa && (
                <span className={styles.cardLabelJa}>{labelJa}</span>
              )}
              <span className={styles.cardLabelEn}>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
