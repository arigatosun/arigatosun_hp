import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import SectionTitle from '@/components/ui/SectionTitle';
import { getNewsList } from '@/data/news';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'ニュース',
};

// 1ページあたりの記事数
const PAGE_SIZE = 6;

// カテゴリは現状は見た目のみ（絞り込みは WordPress 連携時に実装）
const CATEGORIES = ['・ALL >', '・INFOMATION >', '・EVENTS >', '・PRESS >'];

type NewsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const news = await getNewsList();
  const { page } = await searchParams;

  const totalPages = Math.max(1, Math.ceil(news.length / PAGE_SIZE));
  // 不正・範囲外のページ番号は 1〜totalPages にクランプ
  const requested = Number.parseInt(page ?? '1', 10);
  const currentPage = Math.min(
    totalPages,
    Math.max(1, Number.isFinite(requested) ? requested : 1),
  );
  const pagedNews = news.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const prevHref = currentPage > 1 ? `/news?page=${currentPage - 1}` : null;
  const nextHref =
    currentPage < totalPages ? `/news?page=${currentPage + 1}` : null;

  return (
    <div className={styles.page} data-news-list>
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
            {pagedNews.map((item) => (
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

      {/* ページネーション（コンテンツ全幅で中央配置） */}
      <div className={styles.pagination}>
        {prevHref ? (
          <Link
            href={prevHref}
            className={styles.pageButton}
            aria-label="前のページへ"
          >
            &lt; BACK
          </Link>
        ) : (
          <span
            className={`${styles.pageButton} ${styles.pageButtonDisabled}`}
            aria-disabled="true"
          >
            &lt; BACK
          </span>
        )}
        <span className={styles.pageInfo}>
          {currentPage}/{totalPages}
        </span>
        {nextHref ? (
          <Link
            href={nextHref}
            className={styles.pageButton}
            aria-label="次のページへ"
          >
            NEXT &gt;
          </Link>
        ) : (
          <span
            className={`${styles.pageButton} ${styles.pageButtonDisabled}`}
            aria-disabled="true"
          >
            NEXT &gt;
          </span>
        )}
      </div>
    </div>
  );
}
