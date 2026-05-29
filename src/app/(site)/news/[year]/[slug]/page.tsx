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
  if (!y) return { title: '記事が見つかりません' };
  const entry = await getPublishedNewsByYearSlug(y, slug);
  return {
    title: entry ? entry.title : '記事が見つかりません',
    robots: entry ? undefined : 'noindex',
  };
}

// SNS シェアアイコン（現状は見た目のみ）。リンクは将来の実装で差し替え。
const SHARE_ICONS = [
  { src: '/images/sections/news/share-1.svg', label: 'X でシェア', round: false, sizeKey: 'x' as const },
  { src: '/images/sections/news/share-2.png', label: 'シェア', round: true, sizeKey: 'fb' as const },
  { src: '/images/sections/news/share-3.svg', label: 'シェア', round: false, sizeKey: 'line' as const },
  { src: '/images/sections/news/share-4.svg', label: 'リンクをコピー', round: false, sizeKey: 'link' as const },
];

function renderShareIcons() {
  return SHARE_ICONS.map((icon) => {
    const sizeClass =
      icon.sizeKey === 'x'
        ? styles.shareIconX
        : icon.sizeKey === 'fb'
          ? styles.shareIconFb
          : icon.sizeKey === 'line'
            ? styles.shareIconLine
            : styles.shareIconLink;
    return (
      <span
        key={icon.src}
        className={`${styles.shareIcon} ${sizeClass} ${
          icon.round ? styles.shareIconRound : ''
        }`}
        role="img"
        aria-label={icon.label}
      >
        <Image src={icon.src} alt="" width={24} height={24} />
      </span>
    );
  });
}

export default async function NewsDetailPage({ params }: Props) {
  const { year, slug } = await params;
  const y = parseYear(year);
  if (!y) notFound();

  const entry = await getPublishedNewsByYearSlug(y, slug);
  if (!entry) notFound();

  const contentHtml = renderNewsContentToHtml(entry.content);

  return (
    <div className={styles.page} data-news-detail>
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
            <div className={styles.share}>{renderShareIcons()}</div>
            <span className={styles.headerDivider} aria-hidden="true" />

            {/* TipTap が生成した HTML を出力。コンテンツは認証済み管理者が作成した信頼コンテンツ。 */}
            <div
              className={styles.body}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            <span className={styles.bottomDividerSp} aria-hidden="true" />
            <div className={styles.shareBottomSp}>{renderShareIcons()}</div>
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
