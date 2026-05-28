'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './NewsSection.module.scss';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import { createPublicClient } from '@/lib/supabase/public';
import { formatNewsDate, newsDetailHref } from '@/lib/news/format';
import type { Category, NewsListItem } from '@/types/news';

const POSTS_PER_LOAD = 4;

type CategoryTab = { slug: string; label: string };
const ALL_TAB: CategoryTab = { slug: 'all', label: '・ALL >' };

export default function NewsSection() {
  const menuRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef(0);
  const [news, setNews] = useState<NewsListItem[]>([]);
  const [tabs, setTabs] = useState<CategoryTab[]>([ALL_TAB]);
  const [loading, setLoading] = useState(true);

  // 公開 URL: anon 専用クライアントを使用。createBrowserClient (cookie 連動) だと
  // admin ログイン中の管理者 cookie で下書きも読めてしまうため createPublicClient で固定。
  useEffect(() => {
    const supabase = createPublicClient();
    let cancelled = false;

    async function loadInitial() {
      const [{ data: cats }, { data: rows }] = await Promise.all([
        supabase
          .from('categories')
          .select('id, slug, label, display_order')
          .order('display_order', { ascending: true }),
        supabase
          .from('news')
          .select(
            'id, slug, slug_year, title, thumbnail_url, published_at, category:categories!inner(slug, label)',
          )
          .order('published_at', { ascending: false })
          .limit(POSTS_PER_LOAD),
      ]);

      if (cancelled) return;

      if (cats) {
        const items: CategoryTab[] = (cats as Category[]).map((c) => ({
          slug: c.slug,
          label: `・${c.label} >`,
        }));
        setTabs([ALL_TAB, ...items]);
      }

      if (rows) {
        setNews(
          rows.map((row) => ({
            id: row.id,
            slug: row.slug,
            slug_year: row.slug_year,
            title: row.title,
            thumbnail_url: row.thumbnail_url,
            published_at: row.published_at,
            category: row.category ?? null,
          })),
        );
      }

      setLoading(false);
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCategoryClick = useCallback(
    (index: number) => {
      if (activeRef.current === index) return;
      const menu = menuRef.current;
      if (!menu) return;

      const items = menu.children;
      const prevItem = items[activeRef.current];
      const nextItem = items[index];

      if (prevItem) prevItem.className = styles.categoryItem;
      if (nextItem) nextItem.className = styles.categoryItemActive;

      activeRef.current = index;

      const cat = tabs[index];
      const supabase = createPublicClient();
      setLoading(true);

      let query = supabase
        .from('news')
        .select(
          'id, slug, slug_year, title, thumbnail_url, published_at, category:categories!inner(slug, label)',
        )
        .order('published_at', { ascending: false })
        .limit(POSTS_PER_LOAD);

      if (cat.slug !== 'all') {
        query = query.eq('categories.slug', cat.slug);
      }

      query.then(({ data }) => {
        setNews(
          (data ?? []).map((row) => ({
            id: row.id,
            slug: row.slug,
            slug_year: row.slug_year,
            title: row.title,
            thumbnail_url: row.thumbnail_url,
            published_at: row.published_at,
            category: row.category ?? null,
          })),
        );
        setLoading(false);
      });
    },
    [tabs],
  );

  return (
    <section className={styles.news}>
      <div className={styles.inner}>
        {/* 左: タイトル + カテゴリ + ボタン */}
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
            {tabs.map((tab, index) => (
              <li
                key={tab.slug}
                className={index === 0 ? styles.categoryItemActive : styles.categoryItem}
                onClick={() => handleCategoryClick(index)}
              >
                <span>{tab.label}</span>
              </li>
            ))}
          </ul>

          <div className={styles.buttonWrap}>
            <Button href="/news" size="sm">VIEW NEWS &gt;</Button>
          </div>
        </div>

        {/* 右: 記事リスト */}
        <div className={styles.right}>
          {loading ? (
            <p className={styles.loadingText}>読み込み中...</p>
          ) : news.length === 0 ? (
            <p className={styles.loadingText}>該当する記事はまだありません。</p>
          ) : (
            news.map((item, index, arr) => (
              <div key={item.id}>
                <Link
                  href={newsDetailHref(item.slug_year, item.slug)}
                  className={styles.article}
                >
                  <div className={styles.articleContent}>
                    <h3 className={styles.articleTitle}>{item.title}</h3>
                    <div className={styles.articleMeta}>
                      <span className={styles.articleDate}>
                        {formatNewsDate(item.published_at)}
                      </span>
                      <span className={styles.articleTag}>
                        #{item.category?.label ?? ''}
                      </span>
                      <span className={styles.articleArrow} aria-hidden="true">
                        →
                      </span>
                    </div>
                  </div>
                  <div className={styles.articleThumbnail}>
                    {item.thumbnail_url ? (
                      <Image
                        src={item.thumbnail_url}
                        alt={item.title}
                        fill
                        className={styles.thumbnailImage}
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    ) : (
                      <div className={styles.thumbnailPlaceholder} />
                    )}
                  </div>
                </Link>
                {index < arr.length - 1 && (
                  <>
                    <div className={styles.articleDivider} />
                    <div className={styles.articleSpacer} />
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* SP 専用 VIEW NEWS ボタン */}
        <div className={styles.spButtonRow}>
          <Button href="/news">VIEW NEWS &gt;</Button>
        </div>
      </div>
    </section>
  );
}
