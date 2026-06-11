'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.scss';

type SubItem = { href: string; label: string; external?: boolean; hold?: boolean };

// ABOUT 配下（Header のハンバーガーメニューと同一構成）。
// PHILOSOPHY はページ最上部のため /about、MEMBER / COMPANY PROFILE はアンカー。
const aboutSubmenu: SubItem[] = [
  { href: '/about', label: 'PHILOSOPHY' },
  { href: '/about#member', label: 'MEMBER' },
  { href: '/about#company-profile', label: 'COMPANY PROFILE' },
];

const serviceSubmenu: SubItem[] = [
  { href: '/service/ai-dev', label: 'AI / DEVELOPMENT' },
  { href: '/service/design-branding', label: 'DESIGN / BRANDING' },
  { href: '/service/ip-creative', label: 'IP / CREATIVE' },
];

// SNS 配下（すべて外部リンク）。hold:true はリンク先未確定（href='#'）。
const snsSubmenu: SubItem[] = [
  { href: 'https://www.instagram.com/arigatosun_inc', label: 'INSTAGRAM', external: true },
  { href: '#', label: 'YOUTUBE', external: true, hold: true },
  { href: 'https://x.com/arigatosun_inc', label: 'X', external: true },
];

// 外部リンクを示す右上矢印アイコン。
function ExternalIcon() {
  return (
    <svg
      className={styles.externalIcon}
      width="14"
      height="14"
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

// 開閉トグル（丸囲み ⊕ / ⊖）。Header と同一の Figma 支給 SVG。
// 閉＝ ⊕（縦横バー）、開＝ ⊖（横バーのみ）。色は currentColor。
function AccordionToggleIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={styles.accordionIcon}
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

// サブメニューリンク（内部 Link / 外部 a を出し分け）。
function SubMenuLink({ item }: { item: SubItem }) {
  const content = (
    <>
      ・{item.label}
      {item.external && <ExternalIcon />}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        className={styles.subMenuItem}
        {...(item.hold ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} className={styles.subMenuItem}>
      {content}
    </Link>
  );
}

// アコーディオン1ブロック（ABOUT / SERVICE / SNS）。
// labelHref があればラベルはページ遷移 Link、無ければトグル用 button（SNS）。
function AccordionItem({
  itemKey,
  label,
  labelHref,
  submenu,
  open,
  onToggle,
}: {
  itemKey: string;
  label: string;
  labelHref?: string;
  submenu: SubItem[];
  open: boolean;
  onToggle: (key: string) => void;
}) {
  return (
    <li>
      <div className={styles.accordionHeader}>
        {labelHref ? (
          <Link href={labelHref} className={styles.mainMenuItem}>
            {label}
          </Link>
        ) : (
          <button
            type="button"
            className={`${styles.mainMenuItem} ${styles.accordionLabelButton}`}
            onClick={() => onToggle(itemKey)}
            aria-expanded={open}
          >
            {label}
          </button>
        )}
        <button
          type="button"
          className={styles.accordionToggle}
          onClick={() => onToggle(itemKey)}
          aria-expanded={open}
          aria-label={open ? `${label} のサブメニューを閉じる` : `${label} のサブメニューを開く`}
        >
          <AccordionToggleIcon open={open} />
        </button>
      </div>
      <div
        className={`${styles.accordionPanel} ${open ? styles.accordionPanelOpen : ''}`}
      >
        <ul className={styles.subMenu}>
          {submenu.map((sub) => (
            <li key={sub.label}>
              <SubMenuLink item={sub} />
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export default function FooterNav() {
  // 複数同時に開ける（キーごと）。Header のハンバーガーと同方式。
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <nav className={styles.nav}>
      <ul className={styles.mainMenu}>
        <AccordionItem
          itemKey="about"
          label="ABOUT"
          labelHref="/about"
          submenu={aboutSubmenu}
          open={!!openMenus.about}
          onToggle={toggle}
        />
        <AccordionItem
          itemKey="service"
          label="SERVICE"
          labelHref="/service"
          submenu={serviceSubmenu}
          open={!!openMenus.service}
          onToggle={toggle}
        />
        <li>
          <Link href="/works" className={styles.mainMenuItem}>
            WORKS
          </Link>
        </li>
        <li>
          <Link href="/news" className={styles.mainMenuItem}>
            NEWS
          </Link>
        </li>
        <li>
          <Link href="/contact" className={styles.mainMenuItem}>
            CONTACT US
          </Link>
        </li>
        <AccordionItem
          itemKey="sns"
          label="SNS"
          submenu={snsSubmenu}
          open={!!openMenus.sns}
          onToggle={toggle}
        />
      </ul>
    </nav>
  );
}
