import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import SectionTitle from '@/components/ui/SectionTitle';
import { getCategories, getPublishedNewsList } from '@/lib/news/queries';
import { formatNewsDate, newsDetailHref } from '@/lib/news/format';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'ニュース',
  description:
    '株式会社アリガトサンのニュース・お知らせ一覧。AI開発・デザイン・ブランディング・IPコンテンツに関する最新情報をお届けします。',
};

// 1ページあたりの記事数
const PAGE_SIZE = 6;

type NewsPageProps = {
  searchParams: Promise<{ page?: string; category?: string }>;
};

export const revalidate = 60; // ISR で1分キャッシュ

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const { page, category } = await searchParams;
  const activeCategory = category ?? 'all';

  const [news, categories] = await Promise.all([
    getPublishedNewsList({ categorySlug: activeCategory }),
    getCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(news.length / PAGE_SIZE));
  const requested = Number.parseInt(page ?? '1', 10);
  const currentPage = Math.min(
    totalPages,
    Math.max(1, Number.isFinite(requested) ? requested : 1),
  );
  const pagedNews = news.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const buildPageHref = (p: number) => {
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `/news?${qs}` : '/news';
  };

  const buildCategoryHref = (slug: string) => {
    if (slug === 'all') return '/news';
    return `/news?category=${slug}`;
  };

  const prevHref = currentPage > 1 ? buildPageHref(currentPage - 1) : null;
  const nextHref = currentPage < totalPages ? buildPageHref(currentPage + 1) : null;

  // 「ALL >」を先頭にしてカテゴリーリストを構築
  const tabs = [
    { slug: 'all', label: 'ALL' },
    ...categories.map((c) => ({ slug: c.slug, label: c.label })),
  ];

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
            {tabs.map((tab) => {
              const isActive = activeCategory === tab.slug;
              return (
                <li
                  key={tab.slug}
                  className={isActive ? styles.categoryActive : styles.category}
                >
                  <Link href={buildCategoryHref(tab.slug)}>
                    <span>・{tab.label} &gt;</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <span className={styles.sidebarDivider} aria-hidden="true" />
          <Link href="/contact" className={styles.contactLink}>
            ・CONTACT &gt;
          </Link>
        </aside>

        {/* 右: 記事リスト */}
        <div className={styles.main}>
          {pagedNews.length === 0 ? (
            <p className={styles.emptyMessage}>該当する記事がまだありません。</p>
          ) : (
            <ul className={styles.articleList}>
              {pagedNews.map((item) => (
                <li key={item.id} className={styles.articleItem}>
                  <Link
                    href={newsDetailHref(item.slug_year, item.slug)}
                    className={styles.article}
                  >
                    <div className={styles.articleContent}>
                      <h2 className={styles.articleTitle}>{item.title}</h2>
                      <p className={styles.articleMeta}>
                        <span className={styles.articleDate}>
                          {formatNewsDate(item.published_at)}
                        </span>
                        <span className={styles.articleCategory}>
                          #{item.category?.label ?? ''}
                        </span>
                      </p>
                    </div>
                    <div className={styles.articleThumbnail}>
                      {item.thumbnail_url ? (
                        <Image
                          src={item.thumbnail_url}
                          alt=""
                          fill
                          className={styles.thumbnailImage}
                          sizes="(max-width: 1023px) 40vw, 266px"
                        />
                      ) : (
                        <span className={styles.thumbnailPlaceholder} aria-hidden="true" />
                      )}
                    </div>
                  </Link>
                  <span className={styles.articleDivider} aria-hidden="true" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          {prevHref ? (
            <Link href={prevHref} className={styles.pageButton} aria-label="前のページへ">
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
            <Link href={nextHref} className={styles.pageButton} aria-label="次のページへ">
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
      )}
    </div>
  );
}
