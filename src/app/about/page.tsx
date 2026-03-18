'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.scss';
import PrinciplesSection from '@/components/ui/PrinciplesSection';
import BusinessStructureSection from '@/components/ui/BusinessStructureSection';
import MemberSection from '@/components/ui/MemberSection';

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
      {/* 右サイドナビゲーション */}
      <nav className={styles.sideNav}>
        <a
          href="#philosophy"
          className={styles.sideNavItem}
          onClick={(e) => handleScrollTo(e, 'philosophy')}
        >
          ・PHILOSOPHY &gt;
        </a>
        <a
          href="#member"
          className={styles.sideNavItem}
          onClick={(e) => handleScrollTo(e, 'member')}
        >
          ・MEMBER &gt;
        </a>
        <a
          href="#company-profile"
          className={styles.sideNavItem}
          onClick={(e) => handleScrollTo(e, 'company-profile')}
        >
          ・COMPANY PROFILE &gt;
        </a>
        <div className={styles.sideNavArrow}>
          <svg width="8" height="57" viewBox="0 0 8 57" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.32809 56.3536C3.52335 56.5488 3.83993 56.5488 4.03519 56.3536L7.21717 53.1716C7.41244 52.9763 7.41244 52.6597 7.21717 52.4645C7.02191 52.2692 6.70533 52.2692 6.51007 52.4645L3.68164 55.2929L0.853213 52.4645C0.657951 52.2692 0.341369 52.2692 0.146106 52.4645C-0.0491558 52.6597 -0.0491557 52.9763 0.146106 53.1716L3.32809 56.3536ZM3.68164 56L4.18164 56L4.18164 -4.37114e-08L3.68164 0L3.18164 4.37114e-08L3.18164 56L3.68164 56Z" fill="#808080"/>
          </svg>
        </div>
        <Link href="/service" className={styles.sideNavItem}>
          ・SERVICE &gt;
        </Link>
      </nav>

      {/* フィロソフィーセクション */}
      <section id="philosophy" className={styles.philosophySection}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.titleLogo}>
            <Image
              src="/images/about/aboutsectiontitle.png"
              alt="アバウト"
              width={216}
              height={48}
              priority
              className={styles.titleLogoImage}
            />
          </h1>
          <p className={styles.label}>ABOUT</p>
        </div>

        <h2 className={styles.heading}>妥協なき愛で、世を照らす太陽であれ。</h2>

        <div className={styles.body}>
          <p>私たちが掲げる「愛」とは、決して甘い言葉ではなく、プロフェッショナルとしての執念のことです。</p>
          <p>語らぬモノに語り尽くせぬ愛を込め、細部を作り込む。その姿勢だけが、本物を創り出します。</p>
          <p>私たちは、関わるすべての人に想像以上の価値を届け、世の中を明るく照らす存在であり続けます。</p>
        </div>
      </section>

      {/* アリガト３原則セクション */}
      <PrinciplesSection />

      {/* 事業領域と連携体制セクション */}
      <BusinessStructureSection />

      {/* メンバーセクション */}
      <MemberSection />
    </div>
  );
}
