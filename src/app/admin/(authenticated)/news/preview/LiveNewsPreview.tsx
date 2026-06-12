'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useSyncExternalStore } from 'react';
import { renderNewsContentToHtmlClient } from '@/lib/news/render-client';
import { formatNewsDate } from '@/lib/news/format';
import { SITE_URL } from '@/lib/site';
import CopyLinkButton from '@/components/ui/CopyLinkButton';
import type { Json } from '@/types/supabase';
import publicStyles from '@/app/(site)/news/[year]/[slug]/page.module.scss';
import styles from './page.module.scss';

export const NEWS_PREVIEW_STORAGE_KEY = 'arigatosun:news-preview:v1';

interface NewsPreviewPayload {
  title: string;
  slug: string;
  categoryLabel: string;
  description: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
  publishedAt: string | null;
  content: Json;
  editUrl: string;
  capturedAt: string;
}

function subscribe() {
  return () => {};
}

function getSnapshot() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(NEWS_PREVIEW_STORAGE_KEY) ?? '';
}

function getServerSnapshot() {
  return '';
}

function parsePayload(raw: string): NewsPreviewPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<NewsPreviewPayload>;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      title: String(parsed.title ?? ''),
      slug: String(parsed.slug ?? ''),
      categoryLabel: String(parsed.categoryLabel ?? ''),
      description: String(parsed.description ?? ''),
      thumbnailUrl: String(parsed.thumbnailUrl ?? ''),
      thumbnailAlt: String(parsed.thumbnailAlt ?? ''),
      publishedAt: parsed.publishedAt ? String(parsed.publishedAt) : null,
      content: (parsed.content ?? {}) as Json,
      editUrl: String(parsed.editUrl ?? '/admin/news'),
      capturedAt: String(parsed.capturedAt ?? ''),
    };
  } catch {
    return null;
  }
}

function renderShareButtons(shareUrl: string, title: string) {
  const enc = encodeURIComponent;
  const linkTargets = [
    {
      key: 'x',
      src: '/images/sections/news/share-1.svg',
      label: 'X でシェア',
      sizeClass: publicStyles.shareIconX,
      round: false,
      href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(shareUrl)}`,
    },
    {
      key: 'fb',
      src: '/images/sections/news/share-2.png',
      label: 'Facebook でシェア',
      sizeClass: publicStyles.shareIconFb,
      round: true,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`,
    },
    {
      key: 'line',
      src: '/images/sections/news/share-3.svg',
      label: 'LINE でシェア',
      sizeClass: publicStyles.shareIconLine,
      round: false,
      href: `https://social-plugins.line.me/lineit/share?url=${enc(shareUrl)}`,
    },
  ];

  const iconClass = (sizeClass: string | undefined, round: boolean) =>
    `${publicStyles.shareIcon} ${sizeClass ?? ''}${round ? ` ${publicStyles.shareIconRound}` : ''}`;

  return (
    <>
      {linkTargets.map((t) => (
        <a
          key={t.key}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.label}
          className={iconClass(t.sizeClass, t.round)}
        >
          <Image src={t.src} alt="" width={24} height={24} />
        </a>
      ))}
      <CopyLinkButton
        url={shareUrl}
        iconSrc="/images/sections/news/share-4.svg"
        iconClassName={iconClass(publicStyles.shareIconLink, false)}
        label="リンクをコピー"
      />
    </>
  );
}

export default function LiveNewsPreview() {
  const rawPayload = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const payload = useMemo(() => parsePayload(rawPayload), [rawPayload]);
  const contentHtml = useMemo(
    () => (payload ? renderNewsContentToHtmlClient(payload.content) : ''),
    [payload],
  );

  if (!payload) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.emptyTitle}>プレビュー内容がありません</h1>
        <p className={styles.emptyText}>編集画面の「プレビュー」ボタンから開き直してください。</p>
      </div>
    );
  }

  const previewDate = payload.publishedAt || payload.capturedAt || new Date().toISOString();
  const year = new Date(previewDate).getFullYear();
  const previewSlug = payload.slug || 'preview';
  const shareUrl = `${SITE_URL}/news/${year}/${previewSlug}`;
  const title = payload.title || '(タイトル未設定)';

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarText}>
          <span className={styles.badge}>本番プレビュー</span>
          <span className={styles.note}>この画面はまだ公開ページには反映されていません</span>
        </div>
        <a href={payload.editUrl} className={styles.backLink}>
          編集に戻る
        </a>
      </div>

      <div className={publicStyles.page} data-news-detail>
        <div className={publicStyles.inner}>
          {payload.thumbnailUrl && (
            <div className={publicStyles.hero}>
              <Image
                src={payload.thumbnailUrl}
                alt={payload.thumbnailAlt || title}
                fill
                className={publicStyles.heroImg}
                sizes="(max-width: 1023px) 100vw, 1200px"
                priority
              />
            </div>
          )}

          <h1 className={publicStyles.title}>{title}</h1>
          <p className={publicStyles.meta}>
            <span className={publicStyles.date}>{formatNewsDate(previewDate)}</span>
            <span className={publicStyles.category}>
              #{payload.categoryLabel || 'CATEGORY'}
            </span>
          </p>
          <div className={publicStyles.share}>{renderShareButtons(shareUrl, title)}</div>
          <span className={publicStyles.headerDivider} aria-hidden="true" />

          {payload.description && (
            <p className={styles.descriptionPreview}>{payload.description}</p>
          )}

          <div
            className={publicStyles.body}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          <span className={publicStyles.bottomDividerSp} aria-hidden="true" />
          <div className={publicStyles.shareBottomSp}>{renderShareButtons(shareUrl, title)}</div>

          <div className={publicStyles.backWrap}>
            <Link href="/news" className={`${publicStyles.backButton} ${publicStyles.backButtonPc}`}>
              &lt; BACK TO LIST
            </Link>
            <Link href="/" className={`${publicStyles.backButton} ${publicStyles.backButtonSp}`}>
              &lt; TOP PAGE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
