'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.scss';

type DropdownItem = { href: string; label: string };
type NavItem = {
  href: string;
  label: string;
  hasDropdown?: boolean;
  dropdown?: DropdownItem[];
};

// ABOUT 配下のサブ項目。PHILOSOPHY はページ最上部のため ABOUT 本体と同じ /about へ。
// MEMBER / COMPANY PROFILE は各セクションへのアンカー（既存 section id に対応）。
const aboutDropdown: DropdownItem[] = [
  { href: '/about', label: 'PHILOSOPHY' },
  { href: '/about#member', label: 'MEMBER' },
  { href: '/about#company-profile', label: 'COMPANY PROFILE' },
];

const serviceDropdown: DropdownItem[] = [
  { href: '/service/ai-dev', label: 'AI / DEVELOPMENT' },
  { href: '/service/design-branding', label: 'DESIGN / BRANDING' },
  { href: '/service/ip-creative', label: 'IP / CREATIVE' },
];

const leftNav: NavItem[] = [
  { href: '/about', label: 'ABOUT', hasDropdown: true, dropdown: aboutDropdown },
  { href: '/service', label: 'SERVICE', hasDropdown: true, dropdown: serviceDropdown },
  { href: '/works', label: 'WORKS' },
];

const rightNav = [
  { href: '/news', label: 'NEWS' },
  { href: '/contact', label: 'CONTACT US' },
];

const snsNav = [
  {
    href: 'https://www.instagram.com/arigatosun_inc',
    label: 'IG',
    external: true,
  },
];

// CREATIVE PROJECTS バナー（Footer と同じ構成 / SP メニュー用）
const creativeProjects = [
  {
    src: '/images/partners/kusomegane-banner.png',
    alt: 'KUSOMEGANE OFFICIAL STORE',
    href: 'https://online.kusomegane.shop/',
  },
  {
    src: '/images/partners/aseave-banner.png',
    alt: '飲む、深呼吸 ASEAVE',
    href: 'https://aseave.co.jp/',
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
              {item.hasDropdown && item.dropdown && (
                <ul className={styles.dropdown}>
                  {item.dropdown.map((sub) => (
                    <li key={sub.href}>
                      <Link href={sub.href} className={styles.dropdownLink}>
                        <span className={styles.dropdownLinkLabel}>
                          <span className={styles.dropdownLinkLabelText}>
                            {sub.label}
                          </span>
                        </span>
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
                src="/images/icons/mini-logo.svg"
                alt="株式会社アリガトサン"
                width={48}
                height={46}
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
            src="/images/icons/mini-logo.svg"
            alt="株式会社アリガトサン"
            width={56}
            height={53}
            priority
          />
        </Link>

        <button
          className={`${styles.menuButton} ${isMenuOpen ? styles.menuButtonOpen : ''}`}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={isMenuOpen}
        >
          <span className={styles.menuLine} />
          <span className={styles.menuLine} />
          <span className={styles.menuLine} />
        </button>
      </nav>

      {/* モバイルメニュー */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.menuInner}>
          {/* メインナビ */}
          <nav className={styles.primaryNav}>
            {/* ABOUT も SERVICE と同様にサブ項目（各セクションへのアンカー）を展開。
                グループ/サブリストのスタイルは serviceGroup 系を共用。 */}
            <div className={styles.serviceGroup}>
              <Link
                href="/about"
                className={`${styles.mobileNavLink} ${isActive('/about') ? styles.active : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                ABOUT
              </Link>
              <ul className={styles.serviceSubList}>
                {aboutDropdown.map((sub) => (
                  <li key={sub.href}>
                    <Link
                      href={sub.href}
                      className={styles.serviceSubLink}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ・{sub.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.serviceGroup}>
              <Link
                href="/service"
                className={`${styles.mobileNavLink} ${isActive('/service') ? styles.active : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                SERVICE
              </Link>
              <ul className={styles.serviceSubList}>
                {serviceDropdown.map((sub) => (
                  <li key={sub.href}>
                    <Link
                      href={sub.href}
                      className={styles.serviceSubLink}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ・{sub.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/works"
              className={`${styles.mobileNavLink} ${isActive('/works') ? styles.active : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              WORKS
            </Link>
            <Link
              href="/news"
              className={`${styles.mobileNavLink} ${isActive('/news') ? styles.active : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              NEWS
            </Link>
            <Link
              href="/contact"
              className={`${styles.mobileNavLink} ${isActive('/contact') ? styles.active : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              CONTACT US
            </Link>

            <a
              href={snsNav[0].href}
              className={styles.mobileNavLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
            >
              INSTAGRAM
              <svg
                className={styles.externalIcon}
                width="13"
                height="13"
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
          </nav>

          {/* CREATIVE PROJECTS バナー */}
          <div className={styles.creativeSection}>
            <p className={styles.creativeLabel}>CREATIVE PROJECTS</p>
            <div className={styles.creativeBanners}>
              {creativeProjects.map((project) => (
                <a
                  key={project.src}
                  href={project.href}
                  className={styles.bannerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Image
                    src={project.src}
                    alt={project.alt}
                    width={620}
                    height={204}
                    className={styles.bannerImage}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
