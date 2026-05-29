'use client';

import Link from 'next/link';
import styles from './page.module.scss';
import PrinciplesSection from '@/components/ui/PrinciplesSection';
import BusinessStructureSection from '@/components/ui/BusinessStructureSection';
import MemberSection from '@/components/ui/MemberSection';
import CompanyProfileSection from '@/components/ui/CompanyProfileSection';
import SectionTitle from '@/components/ui/SectionTitle';

export default function AboutPage() {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.page}>
      {/* 右サイドナビゲーション
          Figma: PHILOSOPHY をデフォルト active（赤帯）、MEMBER / COMPANY PROFILE はリンク、
          次に縦線セパレーター 1×56px を挟んで SERVICE 外部リンク */}
      <nav className={styles.sideNav}>
        <a
          href="#philosophy"
          className={`${styles.sideNavItem} ${styles.sideNavItemActive}`}
          onClick={(e) => handleScrollTo(e, 'philosophy')}
        >
          <span>・PHILOSOPHY &gt;</span>
        </a>
        <a
          href="#member"
          className={styles.sideNavItem}
          onClick={(e) => handleScrollTo(e, 'member')}
        >
          <span>・MEMBER &gt;</span>
        </a>
        <a
          href="#company-profile"
          className={styles.sideNavItem}
          onClick={(e) => handleScrollTo(e, 'company-profile')}
        >
          <span>・COMPANY PROFILE &gt;</span>
        </a>
        {/* Figma Vector 137 — 縦線 1×56px + 下向き矢印 のセパレータ */}
        <span className={styles.sideNavSeparator} aria-hidden="true">
          <svg
            width="8"
            height="57"
            viewBox="0 0 8 57"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.32809 56.3536C3.52335 56.5488 3.83993 56.5488 4.03519 56.3536L7.21717 53.1716C7.41244 52.9763 7.41244 52.6597 7.21717 52.4645C7.02191 52.2692 6.70533 52.2692 6.51007 52.4645L3.68164 55.2929L0.853213 52.4645C0.657951 52.2692 0.341369 52.2692 0.146106 52.4645C-0.0491558 52.6597 -0.0491557 52.9763 0.146106 53.1716L3.32809 56.3536ZM3.68164 56L4.18164 56L4.18164 -4.37114e-08L3.68164 0L3.18164 4.37114e-08L3.18164 56L3.68164 56Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <Link href="/service" className={styles.sideNavItem}>
          <span>・SERVICE &gt;</span>
        </Link>
      </nav>

      {/* フィロソフィーセクション */}
      <section id="philosophy" className={styles.philosophySection}>
        <SectionTitle
          src="/images/sections/about/title-logo.png"
          alt="アバウト"
          width={216}
          height={48}
          label="ABOUT"
          as="h1"
        />

        {/* "太陽" の間に WORD JOINER (U+2060) を入れて、SP で「太」と「陽」が
            別行に分かれないようにする (見た目には何も挿入しない、改行禁止文字のみ)。 */}
        <h2 className={styles.heading}>妥協なき愛で、世を照らす太⁠陽であれ。</h2>

        <div className={styles.body}>
          {/* Figma 1578:65234 は 2 段落構成。
              JSX の改行・字下げは半角スペースに変換され、letter-spacing 4.48px のため
              視覚的な隙間として現れてしまうので、1段落は 1 行で書いてスペース混入を防ぐ。 */}
          <p>私たちが掲げる「愛」とは、決して甘い言葉ではなく、プロフェッショナルとしての執念のことです。語らぬモノに語り尽くせぬ愛を込め、細部を作り込む。その姿勢だけが、本物を創り出します。</p>
          <p>私たちは、関わるすべての人に想像以上の価値を届け、世の中を明るく照らす存在であり続けます。</p>
        </div>
      </section>

      {/* アリガト３原則セクション */}
      <PrinciplesSection />

      {/* 事業領域と連携体制セクション */}
      <BusinessStructureSection />

      {/* メンバーセクション */}
      <MemberSection />

      {/* 会社写真エリア（Figma Rectangle 346: 1920×1080 のグレー帯 / 後で実画像差し替え） */}
      <div className={styles.companyImageArea} aria-hidden="true" />

      {/* 会社概要セクション */}
      <CompanyProfileSection />
    </div>
  );
}
