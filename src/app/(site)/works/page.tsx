import type { Metadata } from 'next';
import WorksListSection from '@/components/ui/WorksListSection';
import { getAllWorks } from '@/data/works';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Works',
  description:
    '株式会社アリガトサンの実績一覧。AI開発・デザイン・ブランディング・IPコンテンツ等のクリエイティブワークをご紹介します。',
};

export default async function WorksPage() {
  const works = await getAllWorks();

  return (
    <div className={styles.page}>
      <WorksListSection works={works} />
    </div>
  );
}
