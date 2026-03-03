import Link from 'next/link';
import styles from './Footer.module.scss';

const navItems = [
  { href: '/about', label: 'ABOUT' },
  { href: '/service', label: 'SERVICE' },
  { href: '/works', label: 'WORKS' },
  { href: '/news', label: 'NEWS' },
  { href: '/contact', label: 'CONTACT US' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <p className={styles.companyName}>合同会社アリガトサン</p>
          <p className={styles.tagline}>RISE WITH THANKS.</p>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.info}>
          <p className={styles.address}>
            Arigatosun Limited Liability Company
          </p>
        </div>

        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} ARIGATOSUN. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
