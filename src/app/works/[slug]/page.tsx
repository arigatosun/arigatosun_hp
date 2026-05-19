import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAllWorks, getWorkBySlug } from '@/data/works';
import styles from './page.module.scss';

type PageParams = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const works = await getAllWorks();
  return works.map((work) => ({ slug: work.id }));
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  return { title: work ? `${work.client} | WORKS` : 'WORKS' };
}

export default async function WorkDetailPage({ params }: PageParams) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) notFound();

  // works.ts の title は LP 用の \n（除去）と | 区切り（タグライン｜説明文）を含む
  const cleaned = work.title.replace(/\n/g, '');
  const [taglineRaw, ...rest] = cleaned.split('|');
  const tagline = taglineRaw.trim();
  const description = rest.join('|').trim();

  return (
    <div className={styles.page}>
      <article className={styles.detail}>
        <p className={styles.client}>
          <span className={styles.clientLabel}>CLIENT：</span>
          <span className={styles.clientName}>{work.client}</span>
        </p>

        <h1 className={styles.title}>{tagline}</h1>
        {description && <p className={styles.lead}>{description}</p>}

        <div className={styles.imageWrap}>
          <Image
            src={work.image}
            alt={work.client}
            width={work.imageWidth}
            height={work.imageHeight}
            className={styles.image}
          />
        </div>

        <div className={styles.meta}>
          {work.details.map((detail) => (
            <div key={detail.label} className={styles.metaRow}>
              <span className={styles.metaLabel}>{detail.label}</span>
              <span className={styles.metaValue}>{detail.value}</span>
            </div>
          ))}
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>期間：</span>
            <span className={styles.metaValue}>{work.term}</span>
          </div>
        </div>

        <Link href="/works" className={styles.back}>
          &lt; WORKS 一覧へ戻る
        </Link>
      </article>
    </div>
  );
}
