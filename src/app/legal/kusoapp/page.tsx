import type { Metadata } from 'next';
import Link from 'next/link';
import { KUSOAPP_LEGAL_BASE_PATH, KUSOAPP_LEGAL_DOCS } from '@/data/kusoapp-legal';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '規約・ポリシー | KUSOMEGANE PLUS',
  description: 'アプリ「KUSOMEGANE PLUS」の利用規約・プライバシーポリシー・特定商取引法に基づく表記・ガチャ提供割合などの一覧です。',
  alternates: { canonical: KUSOAPP_LEGAL_BASE_PATH },
};

export default function KusoappLegalIndexPage() {
  return (
    <>
      <h1 className={styles.title}>KUSOMEGANE PLUS 規約・ポリシー</h1>
      <ul className={styles.list}>
        {KUSOAPP_LEGAL_DOCS.map((doc) => (
          <li key={doc.slug}>
            <Link href={`${KUSOAPP_LEGAL_BASE_PATH}/${doc.slug}`} className={styles.link}>
              {doc.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
