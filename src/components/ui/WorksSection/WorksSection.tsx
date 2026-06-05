'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './WorksSection.module.scss';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import type { WorkItem } from '@/types/work';
import FooterCharacterLoader from '@/components/three/FooterCharacterLoader';
import DeferMount from '@/components/ui/DeferMount';

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
          <Link
            key={work.id}
            href={`/works/${work.id}`}
            className={`${styles.item} ${index > 0 ? styles.itemSpaced : ''}`}
          >
            {/* 左側: テキスト情報 */}
            <div className={styles.itemLeft}>
              {/* クライアント名: 日本語は .clientName（Noto Sans JP の現状スタイル）、
                  英語は CLIENT ラベルと完全一致させるため素のテキストで .client を継承させる。 */}
              <p className={styles.client}>
                CLIENT：
                {/[぀-ヿ㐀-鿿ｦ-ﾟ]/.test(work.client) ? (
                  <span className={styles.clientName}>{work.client}</span>
                ) : (
                  work.client
                )}
              </p>

              <h3 className={styles.itemTitle}>
                {work.title.split('|').map((part, i, arr) => (
                  <span key={i} className={i > 0 ? styles.afterSeparator : undefined}>
                    {part.split('\n').map((line, j, lines) => {
                      // i>0 && j>0 のセグメントは display:block（lastLine）で行が分かれるため、
                      // 末尾 <br> を足すと block 内に空行が生じる。block 行には <br> を付けない。
                      const isBlockLine = i > 0 && j > 0;
                      return (
                        <span key={j} className={isBlockLine ? styles.lastLine : undefined}>
                          {line}{j < lines.length - 1 && !isBlockLine && <br />}
                        </span>
                      );
                    })}
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
                {work.term && (
                  <p className={styles.detailRow}>
                    <span className={styles.detailLabel}>TERM：</span>
                    <span className={styles.detailValue}>{work.term}</span>
                  </p>
                )}
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
                {/* VIEW MORE（アイテム全体が詳細リンクなので、入れ子<a>回避で span 表示のみ） */}
                <span className={styles.viewMore}>
                  <span className={styles.viewMoreText}>VIEW MORE &gt;</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 下部: キャラクター + テキスト + ボタン */}
      <div className={styles.footer}>
        {/* 3Dキャラクター（ありがとくん・座り・Clay rough マテリアル）
            WorksSection 底部 (News セクション直前)。
              - glbPath: arigatokunn_sit_clay.glb (Armature.002 + Sit.001 アニメを Bake 済)
              - IK constraint を Visual Keying で各 deform bone に焼き込み済 → Web で座り姿勢が出る
              - charScale 5.0: 旧 3.0 から大きく（手振りと比べて少し大きめのサイズ感）
              - charPosition X = -scale * armature_x = -5.0 * (-2.70) = +13.50 で中央寄せ
              - loopMode='repeat': Sit はループ前提
            位置確認したい時は `debug` prop を付ければ視覚化される。 */}
        <DeferMount className={styles.footerCharacter}>
          <FooterCharacterLoader
            glbPath="/models/arigatokunn_sit_clay_meshopt.glb?v=opt1"
            meshopt
            charPosition={[13.50, -0.75, 0]}
            charScale={5.0}
            charRotationY={-0.3}
            loopMode="repeat"
            matte
          />
        </DeferMount>

        <div className={styles.footerText}>
          <p className={styles.footerServices}>
            AI / DEVELOPMENT / APPLICATION / DESIGN / UI / UX / BRANDING / WEB DESIGN / VI / IP / MARKETING / 3D / PHOTOGRAPHY / MOVIE etc...
          </p>
          <p className={styles.footerCopyright}>
            &copy; 2026 ARIGATOSUN. ALL RIGHTS RESERVED.
          </p>
        </div>

        <div className={styles.footerButton}>
          <Button href="/works" size="sm">VIEW WORKS &gt;</Button>
        </div>
      </div>
    </section>
  );
}
