import Link from 'next/link';
import { signOut } from '../../_actions/auth';
import styles from './AdminHeader.module.scss';

interface AdminHeaderProps {
  email: string;
}

export default function AdminHeader({ email }: AdminHeaderProps) {
  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <Link href="/admin" className={styles.brand}>
          ARIGATOSUN <span className={styles.brandSub}>Admin</span>
        </Link>
        <nav className={styles.nav} aria-label="管理画面ナビゲーション">
          <Link href="/admin" className={styles.navLink}>
            ダッシュボード
          </Link>
          {/* 後続 Phase でニュース・カテゴリーへのリンクを追加 */}
        </nav>
        <div className={styles.right}>
          <span className={styles.email} title={email}>
            {email}
          </span>
          <form action={signOut}>
            <button type="submit" className={styles.signOut}>
              サインアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
