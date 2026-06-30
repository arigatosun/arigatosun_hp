import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import { INTERVIEWS, getInterviewBySlug } from '@/data/interviews';
import { getInterviewDetailBySlug } from '@/data/interview-detail';
import InterviewArticle from './InterviewArticle';
import styles from './page.module.scss';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return INTERVIEWS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const item = getInterviewBySlug(slug);
  if (!item) return {};
  return {
    title: `Interview | ${item.client}`,
    description: item.heading.join(''),
  };
}

// 個別インタビュー詳細ページ（現状は準備中プレースホルダ。デザイン確定後に本実装で差し替え）。
export default async function InterviewDetailPage({ params }: Params) {
  const { slug } = await params;
  const item = getInterviewBySlug(slug);
  if (!item) notFound();

  // 本文（記事）があれば本実装、無ければ準備中プレースホルダ。
  const detail = getInterviewDetailBySlug(slug);
  if (detail) return <InterviewArticle detail={detail} />;

  return (
    <article className={styles.page}>
      <Link href="/interview" className={styles.back}>
        &lt; INTERVIEW
      </Link>

      <div className={styles.hero}>
        <Image
          src={item.image}
          alt={item.imageAlt ?? ''}
          fill
          quality={90}
          sizes="(max-width: 1023px) 92vw, 1280px"
          className={styles.heroImage}
          priority
        />
      </div>

      <p className={styles.client}>{item.client}</p>
      <h1 className={styles.heading}>
        {item.heading.map((line, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {line}
          </Fragment>
        ))}
      </h1>

      <p className={styles.note}>
        本記事は準備中です。公開までいましばらくお待ちください。
      </p>
    </article>
  );
}
