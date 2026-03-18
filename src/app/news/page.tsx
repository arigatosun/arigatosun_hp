'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.scss';
import type { NewsItem } from '@/lib/wordpress';

const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '';
const PER_PAGE = 8;

const CATEGORIES = [
  { label: '・ALL >', value: 'all', id: 0 },
  { label: '・INFOMATION >', value: 'information', id: 0 },
  { label: '・EVENTS >', value: 'events', id: 0 },
  { label: '・PRESS >', value: 'press', id: 0 },
];

type WPPost = {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  categories: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
};

type WPCategory = { id: number; name: string; slug: string };

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}/${day}`;
}

function toNewsItem(post: WPPost): NewsItem {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  const terms = post._embedded?.['wp:term']?.[0];
  const category = terms?.[0];

  return {
    id: post.id,
    slug: post.slug,
    title: stripHtml(post.title.rendered),
    date: formatDate(post.date),
    tag: category ? `#${category.name.toUpperCase()}` : '',
    thumbnail: media?.source_url || '',
    excerpt: stripHtml(post.excerpt.rendered),
    content: '',
  };
}

export default function NewsPage() {
  const menuRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef(0);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState(CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // カテゴリ一覧取得
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${API_URL}/categories?per_page=100`);
        if (!res.ok) return;
        const wpCats: WPCategory[] = await res.json();
        setCategories(prev =>
          prev.map(cat => {
            if (cat.value === 'all') return cat;
            const found = wpCats.find(wc => wc.slug === cat.value);
            return found ? { ...cat, id: found.id } : cat;
          })
        );
      } catch {
        // カテゴリ取得失敗時はデフォルトのまま
      }
    }
    loadCategories();
  }, []);

  // 記事取得（ページネーション対応）
  const loadPosts = useCallback(async (page: number, categoryId?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        _embed: 'true',
        per_page: String(PER_PAGE),
        page: String(page),
      });
      if (categoryId) params.set('categories', String(categoryId));

      const res = await fetch(`${API_URL}/posts?${params}`);
      if (!res.ok) { setNews([]); setTotalPages(1); return; }

      const total = res.headers.get('X-WP-TotalPages');
      setTotalPages(total ? parseInt(total, 10) : 1);

      const posts: WPPost[] = await res.json();
      setNews(posts.map(toNewsItem));
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回読み込み
  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  // カテゴリ切り替え
  const handleCategoryClick = useCallback((index: number) => {
    if (activeRef.current === index) return;
    const menu = menuRef.current;
    if (!menu) return;

    const items = menu.children;
    const prevItem = items[activeRef.current];
    const nextItem = items[index];

    if (prevItem) prevItem.className = styles.categoryItem;
    if (nextItem) nextItem.className = styles.categoryItemActive;

    activeRef.current = index;
    setCurrentPage(1);

    const cat = categories[index];
    loadPosts(1, cat.value !== 'all' && cat.id > 0 ? cat.id : undefined);
  }, [categories, loadPosts]);

  // ページ切り替え
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const cat = categories[activeRef.current];
    loadPosts(page, cat.value !== 'all' && cat.id > 0 ? cat.id : undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages, categories, loadPosts]);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* 左側: タイトル + カテゴリ + CONTACT */}
        <div className={styles.left}>
          <div className={styles.header}>
            <h1 className={styles.titleLogo}>
              <Image
                src="/images/top/newstitlelogo.png"
                alt="ニュース"
                width={183}
                height={45}
                className={styles.titleLogoImage}
              />
            </h1>
            <p className={styles.label}>NEWS</p>
          </div>

          <ul className={styles.categoryList} ref={menuRef}>
            {categories.map((cat, index) => (
              <li
                key={cat.value}
                className={index === 0 ? styles.categoryItemActive : styles.categoryItem}
                onClick={() => handleCategoryClick(index)}
              >
                <span>{cat.label}</span>
              </li>
            ))}
          </ul>

          <Link href="/contact" className={styles.contactLink}>
            ・CONTACT &gt;
          </Link>
        </div>

        {/* 右側: 記事リスト + ページネーション */}
        <div className={styles.right}>
          {loading ? (
            <p className={styles.statusText}>読み込み中...</p>
          ) : news.length === 0 ? (
            <p className={styles.statusText}>記事がありません</p>
          ) : (
            <>
              {news.map((item, index) => (
                <div key={item.id}>
                  <Link href={`/news/${item.slug}`} className={styles.article}>
                    <div className={styles.articleContent}>
                      <h2 className={styles.articleTitle}>{item.title}</h2>
                      <div className={styles.articleMeta}>
                        <span className={styles.articleDate}>{item.date}</span>
                        <span className={styles.articleTag}>{item.tag}</span>
                      </div>
                    </div>
                    <div className={styles.articleThumbnail}>
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className={styles.thumbnailImage}
                        />
                      ) : (
                        <div className={styles.thumbnailPlaceholder} />
                      )}
                    </div>
                  </Link>
                  <div className={styles.articleDivider} />
                  {index < news.length - 1 && <div className={styles.articleSpacer} />}
                </div>
              ))}

              {/* ページネーション */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={`${styles.paginationButton} ${currentPage <= 1 ? styles.paginationDisabled : ''}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    &lt; BACK
                  </button>
                  <span className={styles.paginationInfo}>
                    {currentPage}/{totalPages}
                  </span>
                  <button
                    className={`${styles.paginationButton} ${currentPage >= totalPages ? styles.paginationDisabled : ''}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    NEXT &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
