'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import styles from './statusPage.module.scss';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 本番では監視サービスに送る想定。最低限コンソールには残す。
    console.error(error);
  }, [error]);

  return (
    <section className={styles.wrap}>
      <p className={styles.code}>ERROR</p>
      <h1 className={styles.title}>問題が発生しました</h1>
      <p className={styles.text}>
        一時的なエラーが発生しました。お手数ですが、もう一度お試しください。
      </p>
      <div className={styles.action}>
        <button type="button" className={styles.retry} onClick={reset}>
          再読み込み
        </button>
        <Button href="/">TOP へ戻る &gt;</Button>
      </div>
    </section>
  );
}
