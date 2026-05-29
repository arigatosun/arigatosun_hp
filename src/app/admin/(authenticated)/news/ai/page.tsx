import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AiComposer from '../_components/AiComposer';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'AIで作成',
};

export default async function NewsAiComposePage() {
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
        <span>AIで作成</span>
      </nav>
      <h1 className={styles.title}>AIでニュースを作成</h1>
      <p className={styles.lead}>
        伝えたい内容・素材（メモ・議事録・プレス文・箇条書き等）を貼り付けて「AIで生成」を押すと、
        SEO最適化されたタイトル・スラッグ・カテゴリ・説明文・本文をまとめて下書きします。
        生成後は通常のフォームで確認・編集してから公開してください。
      </p>
      <AiComposer initialCategories={categories ?? []} />
    </div>
  );
}
