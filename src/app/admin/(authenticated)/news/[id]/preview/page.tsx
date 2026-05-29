import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { renderNewsContentToHtml } from '@/lib/news/render';
import { formatNewsDate } from '@/lib/news/format';
import styles from './page.module.scss';

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'プレビュー',
};

export default async function NewsPreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 認証済みクライアントなので下書きも取得できる（公開前の確認用）。
  const { data: news, error } = await supabase
    .from('news')
    .select('*, categories(slug, label)')
    .eq('id', id)
    .single();

  if (error || !news) {
    notFound();
  }

  const contentHtml = renderNewsContentToHtml(news.content);
  const isPublished = news.status === 'published';

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <span className={styles.badge} data-published={isPublished}>
          {isPublished ? '公開中（プレビュー）' : '下書きプレビュー'}
        </span>
        <Link href={`/admin/news/${id}/edit`} className={styles.backLink}>
          ← 編集に戻る
        </Link>
      </div>

      <article className={styles.article}>
        {news.thumbnail_url && (
          <div className={styles.eyecatch}>
            <Image
              src={news.thumbnail_url}
              alt={news.thumbnail_alt ?? news.title}
              width={760}
              height={428}
              className={styles.eyecatchImg}
              unoptimized
            />
          </div>
        )}

        <h1 className={styles.title}>{news.title || '(タイトル未設定)'}</h1>
        <p className={styles.meta}>
          <span>{formatNewsDate(news.published_at)}</span>
          {news.categories?.label && <span className={styles.category}>#{news.categories.label}</span>}
        </p>

        {news.description && <p className={styles.description}>{news.description}</p>}

        <div className={styles.body} dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>
    </div>
  );
}
