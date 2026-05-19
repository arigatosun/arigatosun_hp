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
                  <span>・</span>
                  <span className={styles.label}>
                    {item.key} &gt;
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <span className={styles.divider} aria-hidden="true">
          <svg viewBox="0 0 8 57" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3.32809 56.3536C3.52335 56.5488 3.83993 56.5488 4.03519 56.3536L7.21717 53.1716C7.41244 52.9763 7.41244 52.6597 7.21717 52.4645C7.02191 52.2692 6.70533 52.2692 6.51007 52.4645L3.68164 55.2929L0.853213 52.4645C0.657951 52.2692 0.341369 52.2692 0.146106 52.4645C-0.0491558 52.6597 -0.0491557 52.9763 0.146106 53.1716L3.32809 56.3536ZM3.68164 56L4.18164 56L4.18164 -4.37114e-08L3.68164 0L3.18164 4.37114e-08L3.18164 56L3.68164 56Z"
              fill="currentColor"
            />
          </svg>
        </span>

        <ul className={styles.list}>
          <li className={styles.item}>
            <Link href="/news" className={styles.link}>
              <span>・</span>
              <span className={styles.label}>NEWS &gt;</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
