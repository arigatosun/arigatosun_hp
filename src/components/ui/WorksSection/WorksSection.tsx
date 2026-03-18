'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './WorksSection.module.scss';
import Button from '@/components/ui/Button';
import FooterCharacterLoader from '@/components/three/FooterCharacterLoader';

type WorkItem = {
  id: string;
  client: string;
  title: string;
  details: { label: string; value: string }[];
  term: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
};

const WORKS_DATA: WorkItem[] = [
  {
    id: 'work-1',
    client: 'THOOT',
    title: 'ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。',
    details: [
      { label: 'AI / D：', value: 'プロジェクトマネジメント、システム実装' },
      { label: 'D / B：', value: 'ディレクション、ロゴデザイン' },
      { label: 'IP / C：', value: 'キャラクター設計' },
    ],
    term: '2024.7 - 2024.10',
    image: '/images/top/locoreachimage.png',
    imageWidth: 868,
    imageHeight: 675,
  },
  {
    id: 'work-2',
    client: 'THOOT',
    title: 'ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。',
    details: [
      { label: 'AI / D：', value: 'プロジェクトマネジメント、システム実装' },
      { label: 'D / B：', value: 'ディレクション、ロゴデザイン' },
      { label: 'IP / C：', value: 'キャラクター設計' },
    ],
    term: '2024.7 - 2024.10',
    image: '/images/top/locoreachimage.png',
    imageWidth: 868,
    imageHeight: 675,
  },
];

export default function WorksSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // VIEW MORE の赤塗り背景をスクロール表示時に左→右アニメーション
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const viewMoreElements = section.querySelectorAll(`.${styles.viewMoreText}`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.viewMoreRevealed);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    viewMoreElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.works} ref={sectionRef}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <h2 className={styles.titleLogo}>
          <Image
            src="/images/top/workstitlelogo.png"
            alt="ワークス"
            width={204}
            height={46}
            className={styles.titleLogoImage}
          />
        </h2>
        <p className={styles.label}>WORKS</p>
      </div>

      {/* 実績一覧 */}
      <div className={styles.itemsList}>
        {WORKS_DATA.map((work, index) => (
          <div
            key={work.id}
            className={`${styles.item} ${index > 0 ? styles.itemSpaced : ''}`}
          >
            {/* 左側: テキスト情報 */}
            <div className={styles.itemLeft}>
              <p className={styles.client}>CLIENT：{work.client}</p>

              <h3 className={styles.itemTitle}>{work.title}</h3>

              <div className={styles.divider} />

              <div className={styles.detailsList}>
                {work.details.map((detail) => (
                  <p key={detail.label} className={styles.detailRow}>
                    <span className={styles.detailLabel}>{detail.label}</span>
                    <span className={styles.detailValue}>{detail.value}</span>
                  </p>
                ))}
                <p className={styles.detailRow}>
                  <span className={styles.detailLabel}>TERM：</span>
                  <span className={styles.detailValue}>{work.term}</span>
                </p>
              </div>
            </div>

            {/* 右側: 画像 + VIEW MORE */}
            <div className={styles.itemRight}>
              <div className={styles.imageWrap}>
                <Image
                  src={work.image}
                  alt={work.title}
                  width={work.imageWidth}
                  height={work.imageHeight}
                  className={styles.workImage}
                />
                {/* VIEW MORE > ボタン */}
                <a href="/works" className={index === 0 ? styles.viewMore : styles.viewMoreLeft}>
                  <span className={styles.viewMoreText}>VIEW MORE &gt;</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 下部: キャラクター + テキスト + ボタン */}
      <div className={styles.footer}>
        <div className={styles.footerCharacter}>
          <FooterCharacterLoader />
        </div>

        <div className={styles.footerText}>
          <p className={styles.footerServices}>
            AI / DEVELOPMENT / APPLICATION / DESIGN / UI / UX / BRANDING /<br />
            WEB DESIGN / VI / IP / MARKETING / 3D / PHOTOGRAPHY / MOVIE etc...
          </p>
          <p className={styles.footerCopyright}>
            &copy; 2026 ARIGATOSUN. ALL RIGHTS RESEAVED.
          </p>
        </div>

        <div className={styles.footerButton}>
          <Button href="/works">VIEW WORKS &gt;</Button>
        </div>
      </div>
    </section>
  );
}
