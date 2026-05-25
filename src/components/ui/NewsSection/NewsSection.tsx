'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './NewsSection.module.scss';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import type { NewsItem, WPPost, WPCategory } from '@/types/wordpress';
import { NEWS_CATEGORIES } from '@/data/news-categories';
import { NEWS_MOCK } from '@/data/news-mock';

const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '';

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
  // NEWS_CATEGORIES は readonly なので、可変コピーを state に持たせる
  const [categories, setCategories] = useState([...NEWS_CATEGORIES]);
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
            <SectionTitle
              src="/images/sections/news/title-logo.png"
              alt="ニュース"
              width={183}
              height={45}
              label="NEWS"
              className={styles.newsTitle}
            />
          </div>

          <ul className={styles.categoryList} ref={menuRef}>
            {categories.map((cat, index) => (
              <li
                key={cat.value}
                // 選択中カテゴリに赤帯。初回は activeRef = 0 と整合するよう ALL を active 表示。
                // handleCategoryClick が activeRef.current を参照して active クラスを付け替える。
                className={
                  index === 0 ? styles.categoryItemActive : styles.categoryItem
                }
                onClick={() => handleCategoryClick(index)}
              >
                <span>{cat.label}</span>
              </li>
            ))}
          </ul>

          <div className={styles.buttonWrap}>
            <Button href="/news" size="sm">VIEW NEWS &gt;</Button>
          </div>
        </div>

        {/* 右側: 記事リスト（API が空の間は仮データを表示） */}
        <div className={styles.right}>
          {loading ? (
            <p className={styles.loadingText}>読み込み中...</p>
          ) : (
            (news.length > 0 ? news : NEWS_MOCK).map((item, index, arr) => (
              <div key={item.id}>
                <a href={`/news/${item.slug}`} className={styles.article}>
                  <div className={styles.articleContent}>
                    <h3 className={styles.articleTitle}>{item.title}</h3>
                    <div className={styles.articleMeta}>
                      <span className={styles.articleDate}>{item.date}</span>
                      <span className={styles.articleTag}>{item.tag}</span>
                      <span className={styles.articleArrow} aria-hidden="true">
                        →
                      </span>
                    </div>
                  </div>
                  <div className={styles.articleThumbnail}>
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className={styles.thumbnailImage}
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    ) : (
                      <div className={styles.thumbnailPlaceholder} />
                    )}
                  </div>
                </a>
                <div className={styles.articleDivider} />
                {index < arr.length - 1 && <div className={styles.articleSpacer} />}
              </div>
            ))
          )}
        </div>

        {/* SP 専用 VIEW NEWS ボタン（記事リスト後に配置） */}
        <div className={styles.spButtonRow}>
          <Button href="/news" size="sm">VIEW NEWS &gt;</Button>
        </div>
      </div>
    </section>
  );
}
