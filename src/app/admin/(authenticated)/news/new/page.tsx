import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import NewsForm from '../_components/NewsForm';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '新規作成',
};

export default async function NewsCreatePage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  return (
    <div className={styles.root}>
      <nav className={styles.breadcrumb} aria-label="パンくず">
        <Link href="/admin/news" className={styles.breadcrumbLink}>
          ニュース一覧
        </Link>
        <span className={styles.breadcrumbSep} aria-hidden="true">/</span>
        <span>新規作成</span>
      </nav>
      <h1 className={styles.title}>ニュース新規作成</h1>
      <NewsForm categories={categories ?? []} />
    </div>
  );
}
