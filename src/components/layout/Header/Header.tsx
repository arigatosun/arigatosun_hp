'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.scss';

const leftNav = [
  { href: '/about', label: 'ABOUT' },
  { href: '/service', label: 'SERVICE', hasDropdown: true },
  { href: '/works', label: 'WORKS' },
];

const serviceDropdown = [
  { href: '/service/ai-development', label: 'AI / DEVELOPMENT' },
  { href: '/service/design-branding', label: 'DESIGN / BRANDING' },
  { href: '/service/ip-creative', label: 'IP / CREATIVE' },
];

const rightNav = [
  { href: '/news', label: 'NEWS' },
  { href: '/contact', label: 'CONTACT US' },
];

const snsNav = [
  {
    href: 'https://instagram.com/',
    label: 'IG',
    external: true,
  },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        {/* PC ナビゲーション */}
        <ul className={styles.navList}>
          {leftNav.map((item) => (
            <li
              key={item.href}
              className={item.hasDropdown ? styles.hasDropdown : undefined}
            >
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
              >
                {item.label}
              </Link>
              {item.hasDropdown && (
                <ul className={styles.dropdown}>
                  {serviceDropdown.map((sub) => (
                    <li key={sub.href}>
                      <Link href={sub.href} className={styles.dropdownLink}>
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}

          {/* 中央ロゴ */}
          <li>
            <Link href="/" className={styles.logo}>
              <Image
                src="/images/common/mini-logo.svg"
                alt="合同会社アリガトサン"
                width={42}
                height={40}
                priority
              />
            </Link>
          </li>

          {rightNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}

          {snsNav.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className={styles.navLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
                <svg
                  className={styles.externalIcon}
                  width="12"
                  height="12"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 5.5V8.5C8 8.76522 7.89464 9.01957 7.70711 9.20711C7.51957 9.39464 7.26522 9.5 7 9.5H1.5C1.23478 9.5 0.98043 9.39464 0.792893 9.20711C0.605357 9.01957 0.5 8.76522 0.5 8.5V3C0.5 2.73478 0.605357 2.48043 0.792893 2.29289C0.98043 2.10536 1.23478 2 1.5 2H4.5M6.5 0.5H9.5M9.5 0.5V3.5M9.5 0.5L4 6"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </li>
          ))}
        </ul>

        {/* モバイルメニューボタン */}
        <Link href="/" className={styles.mobileLogo}>
          <Image
            src="/images/common/mini-logo.svg"
            alt="合同会社アリガトサン"
            width={32}
            height={30}
            priority
          />
        </Link>

        <button
          className={`${styles.menuButton} ${isMenuOpen ? styles.menuOpen : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="メニューを開く"
          aria-expanded={isMenuOpen}
        >
          <span className={styles.menuLine} />
          <span className={styles.menuLine} />
          <span className={styles.menuLine} />
        </button>
      </nav>

      {/* モバイルメニュー */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <ul className={styles.mobileNavList}>
          {[...leftNav, ...rightNav].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.active : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {snsNav.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className={styles.mobileNavLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
                <svg
                  className={styles.externalIcon}
                  width="12"
                  height="12"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 5.5V8.5C8 8.76522 7.89464 9.01957 7.70711 9.20711C7.51957 9.39464 7.26522 9.5 7 9.5H1.5C1.23478 9.5 0.98043 9.39464 0.792893 9.20711C0.605357 9.01957 0.5 8.76522 0.5 8.5V3C0.5 2.73478 0.605357 2.48043 0.792893 2.29289C0.98043 2.10536 1.23478 2 1.5 2H4.5M6.5 0.5H9.5M9.5 0.5V3.5M9.5 0.5L4 6"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
