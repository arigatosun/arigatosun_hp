'use client';

import { useRef, useCallback } from 'react';
import Image from 'next/image';
import styles from './NewsSection.module.scss';
import Button from '@/components/ui/Button';

type NewsItem = {
  id: string;
  title: string;
  date: string;
  tag: string;
  thumbnail: string;
};

// 仮データ（後日WordPress REST APIから動的取得に置き換え）
const DUMMY_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。',
    date: '2026.10/10',
    tag: '#INFOMATION',
    thumbnail: '/images/top/placeholder.png',
  },
  {
    id: 'news-2',
    title: 'ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトル。',
    date: '2026.10/10',
    tag: '#INFOMATION',
    thumbnail: '/images/top/placeholder.png',
  },
  {
    id: 'news-3',
    title: 'ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。',
    date: '2026.10/10',
    tag: '#INFOMATION',
    thumbnail: '/images/top/placeholder.png',
  },
  {
    id: 'news-4',
    title: 'ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトル。',
    date: '2026.10/10',
    tag: '#INFOMATION',
    thumbnail: '/images/top/placeholder.png',
  },
];

const CATEGORIES = [
  { label: '・ALL >', value: 'all' },
  { label: '・INFOMATION >', value: 'information' },
  { label: '・EVENTS >', value: 'events' },
  { label: '・PRESS >', value: 'press' },
];

export default function NewsSection() {
  const menuRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef(0);

  // DOM直接操作でアクティブカテゴリを切り替え
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
    // TODO: WordPress APIからカテゴリ別記事取得
  }, []);

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
            {CATEGORIES.map((cat, index) => (
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
          {DUMMY_NEWS.map((news, index) => (
            <div key={news.id}>
              <a href={`/news/${news.id}`} className={styles.article}>
                <div className={styles.articleContent}>
                  <h3 className={styles.articleTitle}>{news.title}</h3>
                  <div className={styles.articleMeta}>
                    <span className={styles.articleDate}>{news.date}</span>
                    <span className={styles.articleTag}>{news.tag}</span>
                  </div>
                </div>
                <div className={styles.articleThumbnail}>
                  <Image
                    src={news.thumbnail}
                    alt={news.title}
                    width={300}
                    height={169}
                    className={styles.thumbnailImage}
                  />
                </div>
              </a>
              {/* 装飾ライン */}
              <div className={styles.articleDivider} />
              {/* 最後の記事以外は70pxの余白 */}
              {index < DUMMY_NEWS.length - 1 && <div className={styles.articleSpacer} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
