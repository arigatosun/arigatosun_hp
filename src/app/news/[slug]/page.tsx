import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchPostBySlug } from '@/lib/wordpress';
import styles from './page.module.scss';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    return { title: '記事が見つかりません' };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* 戻るリンク */}
        <Link href="/news" className={styles.backLink}>
          &lt; NEWS一覧に戻る
        </Link>

        {/* 記事ヘッダー */}
        <div className={styles.articleHeader}>
          <div className={styles.meta}>
            <span className={styles.date}>{post.date}</span>
            <span className={styles.tag}>{post.tag}</span>
          </div>
          <h1 className={styles.title}>{post.title}</h1>
        </div>

        {/* アイキャッチ画像 */}
        {post.thumbnail && (
          <div className={styles.heroImage}>
            <img
              src={post.thumbnail}
              alt={post.title}
              className={styles.heroImg}
            />
          </div>
        )}

        {/* 記事本文 */}
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* 下部ナビ */}
        <div className={styles.bottomNav}>
          <Link href="/news" className={styles.backButton}>
            NEWS一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
