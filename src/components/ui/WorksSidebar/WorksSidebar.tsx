import Link from 'next/link';
import SectionTitle from '@/components/ui/SectionTitle';
import styles from './WorksSidebar.module.scss';

export type WorksFilterKey =
  | 'ALL'
  | 'AI / DEVELOPMENT'
  | 'DESIGN / BRANDING'
  | 'IP / CREATIVE'
  | 'CREATIVE PROJECT';

type WorksSidebarProps = {
  active?: WorksFilterKey;
};

const filterItems: { key: WorksFilterKey; href: string }[] = [
  { key: 'ALL', href: '/works' },
  { key: 'AI / DEVELOPMENT', href: '/works' },
  { key: 'DESIGN / BRANDING', href: '/works' },
  { key: 'IP / CREATIVE', href: '/works' },
  { key: 'CREATIVE PROJECT', href: '/works' },
];

export default function WorksSidebar({ active = 'ALL' }: WorksSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <SectionTitle
        src="/images/sections/works/title-logo.png"
        alt="ワークス"
        width={204}
        height={46}
        label="WORKS"
        as="h1"
        className={styles.sectionTitle}
      />

      <nav className={styles.nav}>
        <ul className={styles.list}>
          {filterItems.map((item) => {
            const isActive = item.key === active;
            return (
              <li
                key={item.key}
                className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
              >
                <Link href={item.href} className={styles.link}>
                  <span className={styles.bullet}>・</span>
                  <span className={styles.label}>
                    {item.key} &gt;
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={styles.divider} />

        <ul className={styles.list}>
          <li className={styles.item}>
            <Link href="/news" className={styles.link}>
              <span className={styles.bullet}>・</span>
              <span className={styles.label}>NEWS &gt;</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
