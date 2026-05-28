import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'ダッシュボード',
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [draftRes, publishedRes, scheduledRes, categoriesRes] = await Promise.all([
    supabase.from('news').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase
      .from('news')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .lte('published_at', nowIso),
    supabase
      .from('news')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gt('published_at', nowIso),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
  ]);

  const draftCount = draftRes.count ?? 0;
  const publishedCount = publishedRes.count ?? 0;
  const scheduledCount = scheduledRes.count ?? 0;
  const categoryCount = categoriesRes.count ?? 0;

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>ダッシュボード</h1>
      <p className={styles.lead}>合同会社アリガトサン コーポレートサイト 管理画面</p>

      <div className={styles.grid}>
        <Link href="/admin/news?status=draft" className={styles.card}>
          <span className={styles.cardLabel}>下書き</span>
          <span className={styles.cardCount}>{draftCount}</span>
        </Link>
        <Link href="/admin/news?status=published" className={styles.card}>
          <span className={styles.cardLabel}>公開中</span>
          <span className={styles.cardCount}>{publishedCount}</span>
        </Link>
        <Link href="/admin/news?status=published" className={styles.card}>
          <span className={styles.cardLabel}>予約公開</span>
          <span className={styles.cardCount}>{scheduledCount}</span>
        </Link>
        <Link href="/admin/categories" className={styles.card}>
          <span className={styles.cardLabel}>カテゴリー</span>
          <span className={styles.cardCount}>{categoryCount}</span>
        </Link>
      </div>

      <div className={styles.actions}>
        <Link href="/admin/news/new" className={styles.actionPrimary}>
          + 新しい記事を作成
        </Link>
        <Link href="/admin/news" className={styles.actionSecondary}>
          記事一覧を見る
        </Link>
      </div>
    </div>
  );
}
