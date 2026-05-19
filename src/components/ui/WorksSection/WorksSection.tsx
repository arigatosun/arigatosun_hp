'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './WorksSection.module.scss';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import type { WorkItem } from '@/types/work';

type WorksSectionProps = {
  works: readonly WorkItem[];
};

export default function WorksSection({ works }: WorksSectionProps) {
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
        <SectionTitle
          src="/images/sections/works/title-logo.png"
          alt="ワークス"
          width={204}
          height={46}
          label="WORKS"
          className={styles.sectionTitle}
        />
      </div>

      {/* 実績一覧 */}
      <div className={styles.itemsList}>
        {works.slice(0, 3).map((work, index) => (
          <div
            key={work.id}
            className={`${styles.item} ${index > 0 ? styles.itemSpaced : ''}`}
          >
            {/* 左側: テキスト情報 */}
            <div className={styles.itemLeft}>
              <p className={styles.client}>CLIENT：<span className={styles.clientName}>{work.client}</span></p>

              <h3 className={styles.itemTitle}>
                {work.title.split('|').map((part, i, arr) => (
                  <span key={i} className={i > 0 ? styles.afterSeparator : undefined}>
                    {part.split('\n').map((line, j, lines) => (
                      <span key={j} className={i > 0 && j > 0 ? styles.lastLine : undefined}>
                        {line}{j < lines.length - 1 && <br />}
                      </span>
                    ))}
                    {i < arr.length - 1 && (
                      <span className={styles.separatorWrap}><span className={styles.separator}>|</span></span>
                    )}
                  </span>
                ))}
              </h3>

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
                <Link href="/works" className={index === 0 ? styles.viewMore : styles.viewMoreLeft}>
                  <span className={styles.viewMoreText}>VIEW MORE &gt;</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 下部: キャラクター + テキスト + ボタン */}
      <div className={styles.footer}>
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
