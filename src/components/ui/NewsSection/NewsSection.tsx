'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './NewsSection.module.scss';
import Button from '@/components/ui/Button';
import type { NewsItem } from '@/lib/wordpress';

const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '';

const CATEGORIES = [
  { label: '・ALL >', value: 'all', id: 0 },
  { label: '・INFORMATION >', value: 'information', id: 0 },
  { label: '・EVENTS >', value: 'events', id: 0 },
  { label: '・PRESS >', value: 'press', id: 0 },
];

/** HTMLタグ除去 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/** 日付フォーマット */
function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}/${day}`;
}

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

type WPCategory = {
  id: number;
  name: string;
  slug: string;
};

/** WPPostをNewsItemに変換 */
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

export default function NewsSection() {
  const menuRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef(0);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState(CATEGORIES);
  const [loading, setLoading] = useState(true);

  // カテゴリ一覧を取得してIDをマッピング
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${API_URL}/categories?per_page=100`);
        if (!res.ok) return;
        const wpCats: WPCategory[] = await res.json();

        setCategories(prev => prev.map(cat => {
          if (cat.value === 'all') return cat;
          const found = wpCats.find(wc => wc.slug === cat.value);
          return found ? { ...cat, id: found.id } : cat;
        }));
      } catch {
        // カテゴリ取得失敗時はデフォルトのまま
      }
    }
    loadCategories();
  }, []);

  // 記事を取得
  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/posts?_embed=true&per_page=4`);
        if (!res.ok) return;
        const posts: WPPost[] = await res.json();
        setNews(posts.map(toNewsItem));
      } catch {
        // API接続失敗時は空配列のまま
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  // カテゴリ切り替えで記事をフィルタ取得
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

    // カテゴリ別に記事取得
    const cat = categories[index];
    const params = new URLSearchParams({
      _embed: 'true',
      per_page: '4',
    });
    if (cat.value !== 'all' && cat.id > 0) {
      params.set('categories', String(cat.id));
    }

    setLoading(true);
    fetch(`${API_URL}/posts?${params}`)
      .then(res => res.ok ? res.json() : [])
      .then((posts: WPPost[]) => setNews(posts.map(toNewsItem)))
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, [categories]);

  return (
    <section className={styles.news}>
      <div className={styles.inner}>
        {/* 左側: タイトル + カテゴリ + ボタン */}
        <div className={styles.left}>
          <div className={styles.header}>
            <h2 className={styles.titleLogo}>
              <Image
                src="/images/top/newstitlelogo.png"
                alt="ニュース"
                width={183}
                height={45}
                className={styles.titleLogoImage}
              />
            </h2>
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

          <div className={styles.buttonWrap}>
            <Button href="/news">VIEW NEWS &gt;</Button>
          </div>
        </div>

        {/* 右側: 記事リスト */}
        <div className={styles.right}>
          {loading ? (
            <p className={styles.loadingText}>読み込み中...</p>
          ) : news.length === 0 ? (
            <p className={styles.emptyText}>記事がありません</p>
          ) : (
            news.map((item, index) => (
              <div key={item.id}>
                <a href={`/news/${item.slug}`} className={styles.article}>
                  <div className={styles.articleContent}>
                    <h3 className={styles.articleTitle}>{item.title}</h3>
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
                </a>
                <div className={styles.articleDivider} />
                {index < news.length - 1 && <div className={styles.articleSpacer} />}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
