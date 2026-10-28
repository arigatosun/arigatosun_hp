import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';
import { KUSOAPP_LEGAL_BASE_PATH } from '@/data/kusoapp-legal';
import styles from './layout.module.scss';

// KUSOMEGANE PLUS(アプリ)の規約・ポリシー。アプリ内 WebView からも開くため、
// (site) のヘッダー・3D フッター・オープニングは通さず軽い枠だけにする。
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

export default function KusoappLegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href={KUSOAPP_LEGAL_BASE_PATH} className={styles.brand}>
          KUSOMEGANE PLUS
        </Link>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        運営:
        <a href={SITE_URL} className={styles.company}>
          株式会社アリガトサン
        </a>
      </footer>
    </div>
  );
}
