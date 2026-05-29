import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getPublishedNewsByYearSlug,
  getPublishedNewsParams,
} from '@/lib/news/queries';
import { renderNewsContentToHtml } from '@/lib/news/render';
import { formatNewsDate } from '@/lib/news/format';
import CopyLinkButton from '@/components/ui/CopyLinkButton';
import JsonLd from '@/components/seo/JsonLd';
import styles from './page.module.scss';

type Props = {
  params: Promise<{ year: string; slug: string }>;
};

// 公開済み記事の (year, slug) ペア全件を SSG。
// 予約公開（published_at が未来）はビルド時には除外され、ISR で随時生成される。
export async function generateStaticParams() {
  return getPublishedNewsParams();
}

export const revalidate = 60;
export const dynamicParams = true;

function parseYear(year: string): number | null {
  const n = Number.parseInt(year, 10);
  if (!Number.isFinite(n) || n < 2000 || n > 9999) return null;
  return n;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, slug } = await params;
  const y = parseYear(year);
  if (!y) return { title: '記事が見つかりません', robots: 'noindex' };
  const entry = await getPublishedNewsByYearSlug(y, slug);
  if (!entry) return { title: '記事が見つかりません', robots: 'noindex' };

  // 本文 HTML からタグを除去して要約（meta description / OG 用）。
  const description = renderNewsContentToHtml(entry.content)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);

  return {
    title: entry.title,
    description,
    openGraph: {
      type: 'article',
      title: entry.title,
      description,
      publishedTime: entry.published_at ?? undefined,
      images: entry.thumbnail_url ? [{ url: entry.thumbnail_url }] : undefined,
    },
  };
}

// サイトの正規ドメイン（シェアURLの組み立て用）。
const SITE_ORIGIN = 'https://arigatosun.com';

// SNS シェアボタン。X / Facebook / LINE は通常リンク（サーバー描画）、
// リンクコピーのみクライアント側処理（CopyLinkButton）。
function renderShareButtons(shareUrl: string, title: string) {
  const enc = encodeURIComponent;
  const linkTargets = [
    {
      key: 'x',
      src: '/images/sections/news/share-1.svg',
      label: 'X でシェア',
      sizeClass: styles.shareIconX,
      round: false,
      href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(shareUrl)}`,
    },
    {
      key: 'fb',
      src: '/images/sections/news/share-2.png',
      label: 'Facebook でシェア',
      sizeClass: styles.shareIconFb,
      round: true,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`,
    },
    {
      key: 'line',
      src: '/images/sections/news/share-3.svg',
      label: 'LINE でシェア',
      sizeClass: styles.shareIconLine,
      round: false,
      href: `https://social-plugins.line.me/lineit/share?url=${enc(shareUrl)}`,
    },
  ];

  const iconClass = (sizeClass: string | undefined, round: boolean) =>
    `${styles.shareIcon} ${sizeClass ?? ''}${round ? ` ${styles.shareIconRound}` : ''}`;

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
        iconClassName={iconClass(styles.shareIconLink, false)}
        label="リンクをコピー"
      />
    </>
  );
}

export default async function NewsDetailPage({ params }: Props) {
  const { year, slug } = await params;
  const y = parseYear(year);
  if (!y) notFound();

  const entry = await getPublishedNewsByYearSlug(y, slug);
  if (!entry) notFound();

  const contentHtml = renderNewsContentToHtml(entry.content);
  const shareUrl = `${SITE_ORIGIN}/news/${year}/${slug}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: entry.title,
    datePublished: entry.published_at ?? undefined,
    image: entry.thumbnail_url ? [entry.thumbnail_url] : undefined,
    mainEntityOfPage: shareUrl,
    publisher: {
      '@type': 'Organization',
      name: '株式会社アリガトサン',
      logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/icon.png` },
    },
  };

  return (
    <div className={styles.page} data-news-detail>
      <JsonLd data={articleJsonLd} />
      <div className={styles.inner}>
        <div className={styles.article}>
          {/* 左: アイキャッチ画像 */}
          <div className={styles.eyecatch}>
            {entry.thumbnail_url ? (
              <Image
                src={entry.thumbnail_url}
                alt=""
                fill
                className={styles.eyecatchImg}
                sizes="(max-width: 1023px) 100vw, 640px"
                priority
              />
            ) : (
              <span className={styles.eyecatchPlaceholder} aria-hidden="true" />
            )}
          </div>

          {/* 右: タイトル・日付・シェア・本文 */}
          <div className={styles.rightColumn}>
            <h1 className={styles.title}>{entry.title}</h1>
            <p className={styles.meta}>
              <span className={styles.date}>{formatNewsDate(entry.published_at)}</span>
              <span className={styles.category}>#{entry.category?.label ?? ''}</span>
            </p>
            <div className={styles.share}>{renderShareButtons(shareUrl, entry.title)}</div>
            <span className={styles.headerDivider} aria-hidden="true" />

            {/* TipTap が生成した HTML を出力。コンテンツは認証済み管理者が作成した信頼コンテンツ。 */}
            <div
              className={styles.body}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            <span className={styles.bottomDividerSp} aria-hidden="true" />
            <div className={styles.shareBottomSp}>{renderShareButtons(shareUrl, entry.title)}</div>
          </div>
        </div>

        <div className={styles.backWrap}>
          <Link href="/news" className={`${styles.backButton} ${styles.backButtonPc}`}>
            &lt; BACK TO LIST
          </Link>
          <Link href="/" className={`${styles.backButton} ${styles.backButtonSp}`}>
            &lt; TOP PAGE
          </Link>
        </div>
      </div>
    </div>
  );
}
