'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CHATBOT_MEMBER_PATH } from '@/data/members';
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

// NEWS 配下のサブ項目。/news ページ左サイドバーのカテゴリ絞り込み（?category=<slug>）に紐づく。
// slug は Supabase categories テーブル準拠（information / events / column）。NEWS 本体は ALL = /news。
const newsDropdown: DropdownItem[] = [
  { href: '/news?category=information', label: 'INFORMATION' },
  { href: '/news?category=events', label: 'EVENTS' },
  { href: '/news?category=column', label: 'COLUMN' },
];

const rightNav: NavItem[] = [
  // INTERVIEW: ページ未作成のため暫定 /interview（内容フェーズで実ページ作成）。
  { href: '/interview', label: 'INTERVIEW' },
  { href: '/news', label: 'NEWS', hasDropdown: true, dropdown: newsDropdown },
  { href: '/contact', label: 'CONTACT' },
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

// SP アコーディオンの開閉トグル（丸囲み ⊕ / ⊖）。Figma 支給 SVG をそのまま使用。
// 閉＝ ⊕（縦横バー）、開＝ ⊖（横バーのみ）。色は currentColor（常時黒・タップで赤くしない）。
function AccordionToggleIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={styles.spAccordionIcon}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {open ? (
        <path d="M11 6.48926V7.51074H3V6.48926H11Z" fill="currentColor" />
      ) : (
        <path
          d="M3 7.51029V6.48971H6.47047V3H7.51324V6.48971H11V7.51029H7.51324V11H6.47047V7.51029H3Z"
          fill="currentColor"
        />
      )}
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" />
    </svg>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // SP メニューのアコーディオン開閉状態（キーごと・複数同時に開ける）。
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // 赤背景のアリガトくんチャットページではナビ/ロゴを白文字バリアントにする。
  const onDark = pathname === CHATBOT_MEMBER_PATH;

  const toggleMenu = (key: string) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <header className={`${styles.header} ${onDark ? styles.onDark : ''}`}>
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
                  <AccordionToggleIcon open={!!openMenus.about} />
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
                  <AccordionToggleIcon open={!!openMenus.service} />
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
              href="/interview"
              className={`${styles.mobileNavLink} ${isActive('/interview') ? styles.active : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              INTERVIEW
            </Link>

            {/* NEWS: ABOUT / SERVICE と同じアコーディオン。ラベル＝/news へ遷移 / ▼＝サブ開閉。 */}
            <div className={styles.spAccordion}>
              <div className={styles.spAccordionHeader}>
                <Link
                  href="/news"
                  className={`${styles.spAccordionLabel} ${isActive('/news') ? styles.active : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  NEWS
                </Link>
                <button
                  type="button"
                  className={styles.spAccordionToggle}
                  onClick={() => toggleMenu('news')}
                  aria-expanded={!!openMenus.news}
                  aria-label={openMenus.news ? 'NEWS のサブメニューを閉じる' : 'NEWS のサブメニューを開く'}
                >
                  <AccordionToggleIcon open={!!openMenus.news} />
                </button>
              </div>
              <div
                className={`${styles.spAccordionPanel} ${openMenus.news ? styles.spAccordionPanelOpen : ''}`}
              >
                <ul className={styles.serviceSubList}>
                  {newsDropdown.map((sub) => (
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
              href="/contact"
              className={`${styles.mobileNavLink} ${isActive('/contact') ? styles.active : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              CONTACT
            </Link>
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
