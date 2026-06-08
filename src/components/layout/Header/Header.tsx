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

// SNS ドロップダウン配下（すべて外部リンク）。
// hold:true はリンク先未確定（href='#'）。URL 確定後に href を差し替える。
type SnsItem = { href: string; label: string; hold?: boolean };
const snsDropdown: SnsItem[] = [
  { href: 'https://www.instagram.com/arigatosun_inc', label: 'INSTAGRAM' },
  { href: '#', label: 'YOUTUBE', hold: true },
  { href: 'https://x.com/arigatosun_inc', label: 'X' },
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

// 外部リンクを示す右上矢印アイコン（ヘッダー内で複数箇所に使うため共通化）。
function ExternalIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      className={styles.externalIcon}
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8 5.5V8.5C8 8.76522 7.89464 9.01957 7.70711 9.20711C7.51957 9.39464 7.26522 9.5 7 9.5H1.5C1.23478 9.5 0.98043 9.39464 0.792893 9.20711C0.605357 9.01957 0.5 8.76522 0.5 8.5V3C0.5 2.73478 0.605357 2.48043 0.792893 2.29289C0.98043 2.10536 1.23478 2 1.5 2H4.5M6.5 0.5H9.5M9.5 0.5V3.5M9.5 0.5L4 6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // SP メニューのアコーディオン開閉状態（キーごと・複数同時に開ける）。
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const toggleMenu = (key: string) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

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

          {/* SNS: SERVICE / ABOUT と同じドロップダウン方式。トリガーは遷移先ページが
              無いため非リンク（span）。配下は外部リンク3点（INSTAGRAM/YOUTUBE/X）。 */}
          <li className={styles.hasDropdown}>
            <span className={styles.navLink}>SNS</span>
            <ul className={styles.dropdown}>
              {snsDropdown.map((sns) => (
                <li key={sns.label}>
                  <a
                    href={sns.href}
                    className={styles.dropdownLink}
                    {...(sns.hold
                      ? {}
                      : { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    <span className={styles.dropdownLinkLabel}>
                      <span className={styles.dropdownLinkLabelText}>
                        {sns.label}
                      </span>
                    </span>
                    <ExternalIcon />
                  </a>
                </li>
              ))}
            </ul>
          </li>
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
            {/* ABOUT: ラベル＝/about へ遷移 / ▼アイコン＝サブメニュー開閉。 */}
            <div className={styles.spAccordion}>
              <div className={styles.spAccordionHeader}>
                <Link
                  href="/about"
                  className={`${styles.spAccordionLabel} ${isActive('/about') ? styles.active : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  ABOUT
                </Link>
                <button
                  type="button"
                  className={styles.spAccordionToggle}
                  onClick={() => toggleMenu('about')}
                  aria-expanded={!!openMenus.about}
                  aria-label={openMenus.about ? 'ABOUT のサブメニューを閉じる' : 'ABOUT のサブメニューを開く'}
                >
                  <span
                    className={`${styles.spAccordionIcon} ${openMenus.about ? styles.spAccordionIconOpen : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div
                className={`${styles.spAccordionPanel} ${openMenus.about ? styles.spAccordionPanelOpen : ''}`}
              >
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
            </div>

            {/* SERVICE: ラベル＝/service へ遷移 / ▼アイコン＝サブメニュー開閉。 */}
            <div className={styles.spAccordion}>
              <div className={styles.spAccordionHeader}>
                <Link
                  href="/service"
                  className={`${styles.spAccordionLabel} ${isActive('/service') ? styles.active : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  SERVICE
                </Link>
                <button
                  type="button"
                  className={styles.spAccordionToggle}
                  onClick={() => toggleMenu('service')}
                  aria-expanded={!!openMenus.service}
                  aria-label={openMenus.service ? 'SERVICE のサブメニューを閉じる' : 'SERVICE のサブメニューを開く'}
                >
                  <span
                    className={`${styles.spAccordionIcon} ${openMenus.service ? styles.spAccordionIconOpen : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div
                className={`${styles.spAccordionPanel} ${openMenus.service ? styles.spAccordionPanelOpen : ''}`}
              >
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

            {/* SNS: ABOUT / SERVICE と同じアコーディオン。遷移先ページが無いため
                ラベルもタップで開閉（トグル）。配下は外部リンク3点。 */}
            <div className={styles.spAccordion}>
              <div className={styles.spAccordionHeader}>
                <button
                  type="button"
                  className={styles.spAccordionLabel}
                  onClick={() => toggleMenu('sns')}
                  aria-expanded={!!openMenus.sns}
                >
                  SNS
                </button>
                <button
                  type="button"
                  className={styles.spAccordionToggle}
                  onClick={() => toggleMenu('sns')}
                  aria-expanded={!!openMenus.sns}
                  aria-label={openMenus.sns ? 'SNS のサブメニューを閉じる' : 'SNS のサブメニューを開く'}
                >
                  <span
                    className={`${styles.spAccordionIcon} ${openMenus.sns ? styles.spAccordionIconOpen : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div
                className={`${styles.spAccordionPanel} ${openMenus.sns ? styles.spAccordionPanelOpen : ''}`}
              >
                <ul className={styles.serviceSubList}>
                  {snsDropdown.map((sns) => (
                    <li key={sns.label}>
                      <a
                        href={sns.href}
                        className={styles.serviceSubLink}
                        onClick={() => setIsMenuOpen(false)}
                        {...(sns.hold
                          ? {}
                          : { target: '_blank', rel: 'noopener noreferrer' })}
                      >
                        ・{sns.label}
                        <ExternalIcon size={13} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
