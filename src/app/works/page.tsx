import type { Metadata } from 'next';
import WorksListSection from '@/components/ui/WorksListSection';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'ワークス | WORKS',
  description:
    '合同会社アリガトサンの実績一覧。AI開発・デザイン・ブランディング・IPコンテンツ等のクリエイティブワークをご紹介します。',
};

export default function WorksPage() {
  return (
    <div className={styles.page}>
      <WorksListSection />
    </div>
  );
}
