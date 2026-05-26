import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signIn } from './actions';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '管理画面ログイン',
  robots: 'noindex, nofollow',
};

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next ?? '/admin';
  const error = params.error;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(next);
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <h1 className={styles.title}>管理画面ログイン</h1>
        <p className={styles.subtitle}>アリガトサン コーポレートサイト</p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <form action={signIn} className={styles.form}>
          <input type="hidden" name="next" value={next} />
          <label className={styles.field}>
            <span className={styles.fieldLabel}>メールアドレス</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>パスワード</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className={styles.input}
            />
          </label>
          <button type="submit" className={styles.submit}>
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
