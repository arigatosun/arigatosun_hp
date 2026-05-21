import SectionHeader from '@/components/ui/SectionHeader';
import type { ServicePromiseSection } from '@/types/service';
import styles from './ServicePromiseGrid.module.scss';

type ServicePromiseGridProps = ServicePromiseSection;

/**
 * Hero 直後の 3 カラム promise グリッド
 * Figma SERVICE 詳細ページ「私たちが実現すること」「私たちが実現してきたこと」等
 * - 上: SectionHeader (icon + title + subtitle)
 * - 下: 3 カラム catchphrase + body
 */
export default function ServicePromiseGrid({
  id,
  title,
  subtitle,
  items,
}: ServicePromiseGridProps) {
  return (
    <section className={styles.section} id={id}>
      <SectionHeader
        logo={{
          src: '/images/sections/service/detail/section-sun.svg',
          alt: '',
          width: 61,
          height: 58,
        }}
        title={title}
        subtitle={subtitle}
      />

      <div className={styles.grid}>
        {items.map((item, i) => (
          <div key={i} className={styles.item}>
            <h3 className={styles.catchphrase}>{item.catchphrase}</h3>
            <p className={styles.body}>{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
