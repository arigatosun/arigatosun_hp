import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNewsList, getNewsBySlug } from '@/data/news';
import styles from './page.module.scss';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const news = await getNewsList();
  return news.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getNewsBySlug(slug);
  return { title: entry ? 'ニュース' : '記事が見つかりません' };
}

// SNS シェアアイコン（現状は見た目のみ・リンクは WordPress 連携時に設定）。
// sizeClass は Figma の個別サイズ（X 21×22 / FB 23.5 / LINE 24×23 / Link 20）に対応。
const SHARE_ICONS = [
  { src: '/images/sections/news/share-1.svg', label: 'X でシェア', round: false, sizeKey: 'x' as const },
  { src: '/images/sections/news/share-2.png', label: 'シェア', round: true, sizeKey: 'fb' as const },
  { src: '/images/sections/news/share-3.svg', label: 'シェア', round: false, sizeKey: 'line' as const },
  { src: '/images/sections/news/share-4.svg', label: 'リンクをコピー', round: false, sizeKey: 'link' as const },
];

const renderShareIcons = () =>
  SHARE_ICONS.map((icon) => {
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

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getNewsBySlug(slug);
  if (!entry) notFound();

  return (
    <div className={styles.page} data-news-detail>
      <div className={styles.inner}>
        <div className={styles.article}>
          {/* 左: アイキャッチ画像 */}
          <div className={styles.eyecatch}>
            {entry.thumbnail ? (
              <Image
                src={entry.thumbnail}
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
              <span className={styles.date}>{entry.date}</span>
              <span className={styles.category}>#{entry.category}</span>
            </p>
            <div className={styles.share}>{renderShareIcons()}</div>
            <span className={styles.headerDivider} aria-hidden="true" />

            <div className={styles.body}>
              {entry.body.map((block, index) =>
                block.type === 'heading' ? (
                  <h2 key={index} className={styles.bodyHeading}>
                    {block.text}
                  </h2>
                ) : (
                  <div key={index} className={styles.bodyParagraphs}>
                    {block.paragraphs.map((paragraph, pIndex) => (
                      <p key={pIndex} className={styles.bodyParagraph}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ),
              )}
            </div>

            {/* SP のみ: 本文下に区切り線 + シェアアイコン（中央寄せ） */}
            <span className={styles.bottomDividerSp} aria-hidden="true" />
            <div className={styles.shareBottomSp}>{renderShareIcons()}</div>
          </div>
        </div>

        <div className={styles.backWrap}>
          {/* PC: BACK TO LIST → /news */}
          <Link
            href="/news"
            className={`${styles.backButton} ${styles.backButtonPc}`}
          >
            &lt; BACK TO LIST
          </Link>
          {/* SP: TOP PAGE → / */}
          <Link
            href="/"
            className={`${styles.backButton} ${styles.backButtonSp}`}
          >
            &lt; TOP PAGE
          </Link>
        </div>
      </div>
    </div>
  );
}
