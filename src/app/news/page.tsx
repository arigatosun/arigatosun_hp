import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import SectionTitle from '@/components/ui/SectionTitle';
import { getNewsList } from '@/data/news';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'ニュース',
};

// カテゴリは現状は見た目のみ（絞り込みは WordPress 連携時に実装）
const CATEGORIES = ['・ALL >', '・INFOMATION >', '・EVENTS >', '・PRESS >'];

export default async function NewsPage() {
  const news = await getNewsList();

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* 左: タイトル + カテゴリ + CONTACT */}
        <aside className={styles.sidebar}>
          <SectionTitle
            src="/images/sections/news/title-logo.png"
            alt="ニュース"
            width={183}
            height={45}
            label="NEWS"
            as="h1"
            className={styles.titleSection}
          />
          <ul className={styles.categoryList}>
            {CATEGORIES.map((label, index) => (
              <li
                key={label}
                className={index === 0 ? styles.categoryActive : styles.category}
              >
                <span>{label}</span>
              </li>
            ))}
          </ul>
          <span className={styles.sidebarDivider} aria-hidden="true" />
          <Link href="/contact" className={styles.contactLink}>
            ・CONTACT &gt;
          </Link>
        </aside>

        {/* 右: 記事リスト */}
        <div className={styles.main}>
          <ul className={styles.articleList}>
            {news.map((item) => (
              <li key={item.slug} className={styles.articleItem}>
                <Link href={`/news/${item.slug}`} className={styles.article}>
                  <div className={styles.articleContent}>
                    <h2 className={styles.articleTitle}>{item.title}</h2>
                    <p className={styles.articleMeta}>
                      <span className={styles.articleDate}>{item.date}</span>
                      <span className={styles.articleCategory}>
                        #{item.category}
                      </span>
                    </p>
                  </div>
                  <div className={styles.articleThumbnail}>
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt=""
                        fill
                        className={styles.thumbnailImage}
                        sizes="(max-width: 1023px) 40vw, 266px"
                      />
                    ) : (
                      <span
                        className={styles.thumbnailPlaceholder}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </Link>
                <span className={styles.articleDivider} aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ページネーション（コンテンツ全幅で中央配置・見た目のみ） */}
      <div className={styles.pagination}>
        <span className={`${styles.pageButton} ${styles.pageButtonDisabled}`}>
          &lt; BACK
        </span>
        <span className={styles.pageInfo}>1/2</span>
        <span className={styles.pageButton}>NEXT &gt;</span>
      </div>
    </div>
  );
}
