import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import LegalMarkdown from '@/components/ui/LegalMarkdown';
import { formatLegalDate, KUSOAPP_LEGAL_BASE_PATH, KUSOAPP_LEGAL_DOCS } from '@/data/kusoapp-legal';
import styles from './page.module.scss';

type Props = { params: Promise<{ slug: string }> };

// 一覧にある 9 本だけをビルド時に静的生成する
export const dynamicParams = false;

export function generateStaticParams() {
  return KUSOAPP_LEGAL_DOCS.map(({ slug }) => ({ slug }));
}

function findDoc(slug: string) {
  return KUSOAPP_LEGAL_DOCS.find((doc) => doc.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = findDoc((await params).slug);
  if (!doc) return {};
  return {
    title: `${doc.title} | KUSOMEGANE PLUS`,
    alternates: { canonical: `${KUSOAPP_LEGAL_BASE_PATH}/${doc.slug}` },
  };
}

export default async function KusoappLegalDocPage({ params }: Props) {
  const doc = findDoc((await params).slug);
  if (!doc) notFound();
  const source = await readFile(
    path.join(process.cwd(), 'src/content/legal/kusoapp', `${doc.slug}.md`),
    'utf8',
  );

  return (
    <article>
      <h1 className={styles.title}>{doc.title}</h1>
      <p className={styles.dates}>
        制定日:{formatLegalDate(doc.established)} / 最終改定日:{formatLegalDate(doc.lastRevised)}
      </p>
      <LegalMarkdown source={source} />
      <p className={styles.back}>
        <Link href={KUSOAPP_LEGAL_BASE_PATH}>‹ 規約・ポリシーの一覧へ戻る</Link>
      </p>
    </article>
  );
}
