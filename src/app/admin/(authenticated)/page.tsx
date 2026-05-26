import type { Metadata } from 'next';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'ダッシュボード',
};

export default function AdminDashboardPage() {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>ダッシュボード</h1>
      <p className={styles.lead}>
        Phase A 認証基盤の動作確認用ページです。後続 Phase で News / Categories の管理機能を追加します。
      </p>
      <div className={styles.grid}>
        <div className={styles.cardDisabled}>
          <h2 className={styles.cardTitle}>ニュース管理</h2>
          <p className={styles.cardBody}>Phase B で実装予定</p>
        </div>
        <div className={styles.cardDisabled}>
          <h2 className={styles.cardTitle}>カテゴリー管理</h2>
          <p className={styles.cardBody}>Phase D で実装予定</p>
        </div>
      </div>
    </div>
  );
}
