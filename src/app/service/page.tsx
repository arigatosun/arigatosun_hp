'use client';

import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import styles from './page.module.scss';

const services = [
  {
    id: 'ai-development',
    labelJa: 'AI・開発',
    title: 'AI / DEVELOPMENT',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    tags: [
      ['業務効率システム', 'アプリケーション開発', '画像処理'],
      ['業務効率システム', 'アプリケーション開発', '画像処理'],
      ['業務効率システム', 'アプリケーション開発', '画像処理'],
    ],
    layout: 'imageLeft' as const,
  },
  {
    id: 'design-branding',
    labelJa: 'デザイン・ブランディング',
    title: 'DESIGN / BRANDING',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    tags: [
      ['グラフィックデザイン全般', 'VI設計', 'UI/UXデザイン'],
      ['グラフィックデザイン全般', 'VI設計', 'UI/UXデザイン'],
      ['グラフィックデザイン全般', 'VI設計', 'UI/UXデザイン'],
    ],
    layout: 'imageRight' as const,
  },
  {
    id: 'ip-creative',
    labelJa: 'IP・クリエイティブ',
    title: 'IP / CREATIVE',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    tags: [
      ['キャラクターデザイン', '写真・映像撮影/編集', '3D作成'],
      ['キャラクターデザイン', '写真・映像撮影/編集', '3D作成'],
      ['キャラクターデザイン', '写真・映像撮影/編集', '3D作成'],
    ],
    layout: 'imageLeft' as const,
  },
];

export default function ServicePage() {
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
        <Link href="/about#philosophy" className={`${styles.sideNavItem} ${styles.sideNavItemActive}`}>
          ・PHILOSOPHY &gt;
        </Link>
        <Link href="/about#member" className={styles.sideNavItem}>
          ・MEMBER &gt;
        </Link>
        <Link href="/about#company-profile" className={styles.sideNavItem}>
          ・COMPANY PROFILE &gt;
        </Link>
        <div className={styles.sideNavArrow}>
          <svg width="8" height="57" viewBox="0 0 8 57" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.32809 56.3536C3.52335 56.5488 3.83993 56.5488 4.03519 56.3536L7.21717 53.1716C7.41244 52.9763 7.41244 52.6597 7.21717 52.4645C7.02191 52.2692 6.70533 52.2692 6.51007 52.4645L3.68164 55.2929L0.853213 52.4645C0.657951 52.2692 0.341369 52.2692 0.146106 52.4645C-0.0491558 52.6597 -0.0491557 52.9763 0.146106 53.1716L3.32809 56.3536ZM3.68164 56L4.18164 56L4.18164 -4.37114e-08L3.68164 0L3.18164 4.37114e-08L3.18164 56L3.68164 56Z" fill="#808080"/>
          </svg>
        </div>
        <a
          href="#ai-development"
          className={styles.sideNavItem}
          onClick={(e) => handleScrollTo(e, 'ai-development')}
        >
          ・SERVICE &gt;
        </a>
      </nav>

      {/* ヒーローセクション */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.titleLogo}>
              <Image
                src="/images/top/servicetitlelogo.png"
                alt="サービス"
                width={216}
                height={48}
                priority
                className={styles.titleLogoImage}
              />
            </h1>
            <p className={styles.label}>SERVICE</p>
          </div>

          <div className={styles.heroBody}>
            <p>最先端のAI開発技術で、アイデアや理想を形に。</p>
            <p>デザイン・ブランディングで、世の中に届けるところまで。</p>
            <p>構想からリリースまで一気通貫で進めます。</p>
          </div>
        </div>
      </section>

      {/* サービス一覧 */}
      {services.map((service) => (
        <section
          key={service.id}
          id={service.id}
          className={`${styles.serviceSection} ${
            service.layout === 'imageRight' ? styles.serviceSectionReverse : ''
          }`}
        >
          {/* イメージ画像 */}
          <div className={styles.serviceImage}>
            <div className={styles.serviceImagePlaceholder} />
          </div>

          {/* テキスト情報 */}
          <div className={styles.serviceContent}>
            <p className={styles.serviceLabel}>{service.labelJa}</p>
            <h2 className={styles.serviceTitle}>{service.title}</h2>
            <p className={styles.serviceDesc}>{service.description}</p>

            {/* タグリスト */}
            <div className={styles.serviceTags}>
              {service.tags.map((row, i) => (
                <div key={i} className={styles.serviceTagRow}>
                  {row.map((tag, j) => (
                    <span key={j} className={styles.serviceTag}>{tag}</span>
                  ))}
                </div>
              ))}
            </div>

            <Button href={`/service/${service.id}`}>
              VIEW MORE &gt;
            </Button>
          </div>
        </section>
      ))}
    </div>
  );
}
