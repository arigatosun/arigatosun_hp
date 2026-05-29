import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { deleteNews } from '../../_actions/news';
import StatusBadge, { resolveDisplayStatus } from './_components/StatusBadge';
import ConfirmForm from '../../_components/ConfirmForm';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'ニュース一覧',
};

type StatusFilter = 'all' | 'draft' | 'published';

interface NewsListPageProps {
  searchParams: Promise<{ status?: string; error?: string; deleted?: string }>;
}

function parseStatusFilter(raw: string | undefined): StatusFilter {
  return raw === 'draft' || raw === 'published' ? raw : 'all';
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function NewsListPage({ searchParams }: NewsListPageProps) {
  const params = await searchParams;
  const statusFilter = parseStatusFilter(params.status);
  const error = params.error;
  const deleted = params.deleted === '1';

  const supabase = await createClient();
  let query = supabase
    .from('news')
    .select(
      'id, title, slug, slug_year, status, published_at, updated_at, categories(slug, label)',
    )
    .order('updated_at', { ascending: false });

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data: newsList, error: fetchError } = await query;
  // Server Component は request 単位で1回だけ実行されるため Date.now() の非冪等性は問題にならない
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>ニュース管理</h1>
        <Link href="/admin/news/new" className={styles.newButton}>
          + 新規作成
        </Link>
      </header>

      {deleted && (
        <p className={styles.successBanner} role="status">
          記事を削除しました
        </p>
      )}
      {error && (
        <p className={styles.errorBanner} role="alert">
          {error}
        </p>
      )}
      {fetchError && (
        <p className={styles.errorBanner} role="alert">
          記事の取得に失敗しました: {fetchError.message}
        </p>
      )}

      <nav className={styles.tabs} aria-label="ステータスフィルター">
        <Link
          href="/admin/news"
          className={`${styles.tab} ${statusFilter === 'all' ? styles.tabActive : ''}`}
        >
          すべて
        </Link>
        <Link
          href="/admin/news?status=draft"
          className={`${styles.tab} ${statusFilter === 'draft' ? styles.tabActive : ''}`}
        >
          下書き
        </Link>
        <Link
          href="/admin/news?status=published"
          className={`${styles.tab} ${statusFilter === 'published' ? styles.tabActive : ''}`}
        >
          公開
        </Link>
      </nav>

      {newsList && newsList.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colTitle}>タイトル</th>
                <th className={styles.colStatus}>ステータス</th>
                <th className={styles.colCategory}>カテゴリー</th>
                <th className={styles.colDate}>公開日時</th>
                <th className={styles.colDate}>最終更新</th>
                <th className={styles.colActions}>操作</th>
              </tr>
            </thead>
            <tbody>
              {newsList.map((n) => (
                <tr key={n.id}>
                  <td className={styles.colTitle}>
                    <Link href={`/admin/news/${n.id}/edit`} className={styles.titleLink}>
                      {n.title}
                    </Link>
                    <span className={styles.slug}>
                      /{n.slug_year}/{n.slug}
                    </span>
                  </td>
                  <td className={styles.colStatus}>
                    <StatusBadge
                      status={resolveDisplayStatus(n.status as 'draft' | 'published', n.published_at, nowMs)}
                    />
                  </td>
                  <td className={styles.colCategory}>{n.categories?.label ?? '—'}</td>
                  <td className={styles.colDate}>{formatDate(n.published_at)}</td>
                  <td className={styles.colDate}>{formatDate(n.updated_at)}</td>
                  <td className={styles.colActions}>
                    <Link href={`/admin/news/${n.id}/edit`} className={styles.actionEdit}>
                      編集
                    </Link>
                    <ConfirmForm
                      action={deleteNews}
                      message={`「${n.title}」を完全に削除します。よろしいですか？この操作は取り消せません。`}
                      className={styles.deleteForm}
                    >
                      <input type="hidden" name="id" value={n.id} />
                      <button type="submit" className={styles.actionDelete}>
                        削除
                      </button>
                    </ConfirmForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.empty}>
          {statusFilter === 'all' ? (
            <>
              <p className={styles.emptyText}>記事がまだありません。</p>
              <Link href="/admin/news/new" className={styles.emptyButton}>
                最初の記事を作成
              </Link>
            </>
          ) : (
            <p className={styles.emptyText}>
              {statusFilter === 'draft' ? '下書き' : '公開済み'}の記事はありません。
            </p>
          )}
        </div>
      )}
    </div>
  );
}
