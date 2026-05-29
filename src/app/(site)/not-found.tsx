import type { Metadata } from 'next';
import Button from '@/components/ui/Button';
import styles from './statusPage.module.scss';

export const metadata: Metadata = {
  title: 'ページが見つかりません',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className={styles.wrap}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>ページが見つかりません</h1>
      <p className={styles.text}>
        お探しのページは移動または削除された可能性があります。
      </p>
      <div className={styles.action}>
        <Button href="/">TOP へ戻る &gt;</Button>
      </div>
    </section>
  );
}
