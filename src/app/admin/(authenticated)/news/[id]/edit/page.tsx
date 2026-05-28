import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { deleteNews } from '../../../../_actions/news';
import NewsForm from '../../_components/NewsForm';
import ConfirmForm from '../../../../_components/ConfirmForm';
import StatusBadge, { resolveDisplayStatus } from '../../_components/StatusBadge';
import styles from './page.module.scss';

interface EditPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}

export async function generateMetadata({ params }: EditPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('news').select('title').eq('id', id).single();
  return {
    title: data?.title ? `${data.title} を編集` : 'ニュース編集',
  };
}

export default async function NewsEditPage({ params, searchParams }: EditPageProps) {
  const { id } = await params;
  const { created } = await searchParams;

  const supabase = await createClient();

  const [{ data: news, error: newsError }, { data: categories }] = await Promise.all([
    supabase.from('news').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('display_order', { ascending: true }),
  ]);

  if (newsError || !news) {
    notFound();
  }

  return (
    <div className={styles.root}>
      <nav className={styles.breadcrumb} aria-label="パンくず">
        <Link href="/admin/news" className={styles.breadcrumbLink}>
          ニュース一覧
        </Link>
        <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
        <span>編集</span>
      </nav>

      <div className={styles.header}>
        <h1 className={styles.title}>{news.title || '(タイトル未設定)'}</h1>
        <StatusBadge
          status={resolveDisplayStatus(
            news.status as 'draft' | 'published',
            news.published_at,
            // Server Component は request 単位で1回実行されるため Date.now() の非冪等性は問題にならない
            // eslint-disable-next-line react-hooks/purity
            Date.now(),
          )}
        />
      </div>

      {created === '1' && (
        <p className={styles.successBanner} role="status">
          記事を作成しました。続けて編集できます。
        </p>
      )}

      <NewsForm news={news} categories={categories ?? []} />

      <section className={styles.dangerZone}>
        <h2 className={styles.dangerTitle}>危険な操作</h2>
        <p className={styles.dangerDesc}>削除すると元に戻せません。</p>
        <ConfirmForm
          action={deleteNews}
          message={`「${news.title}」を完全に削除します。よろしいですか？この操作は取り消せません。`}
        >
          <input type="hidden" name="id" value={news.id} />
          <button type="submit" className={styles.dangerButton}>
            この記事を削除する
          </button>
        </ConfirmForm>
      </section>
    </div>
  );
}
