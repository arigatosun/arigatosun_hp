import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllWorks, getWorkBySlug } from '@/data/works';
import { getWorkDetailBySlug } from '@/data/works-detail';
import WorkDetailHero from '@/components/ui/WorkDetailHero';
import WorkLeadBlock from '@/components/ui/WorkLeadBlock';
import WorkTextSection from '@/components/ui/WorkTextSection';
import WorkNamingCard from '@/components/ui/WorkNamingCard';
import WorkParagraph from '@/components/ui/WorkParagraph';
import WorkShowcaseCard from '@/components/ui/WorkShowcaseCard';
import WorkImageGrid from '@/components/ui/WorkImageGrid';
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

  const detail = await getWorkDetailBySlug(slug);

  return (
    <div className={styles.page}>
      {detail && <WorkDetailHero hero={detail.hero} />}

      {detail?.blocks.map((block, index) => {
        if (block.type === 'lead') {
          return (
            <WorkLeadBlock
              key={index}
              heading={block.heading}
              subheading={block.subheading}
              body={block.body}
            />
          );
        }
        if (block.type === 'textSection') {
          return (
            <WorkTextSection
              key={index}
              level={block.level}
              heading={block.heading}
              body={block.body}
            />
          );
        }
        if (block.type === 'namingCard') {
          return <WorkNamingCard key={index} rows={block.rows} />;
        }
        if (block.type === 'paragraph') {
          return <WorkParagraph key={index} body={block.body} />;
        }
        if (block.type === 'showcaseCard') {
          return (
            <WorkShowcaseCard
              key={index}
              background={block.background}
              card={block.card}
              graphic={block.graphic}
            />
          );
        }
        if (block.type === 'imageGrid') {
          return (
            <WorkImageGrid
              key={index}
              images={block.images}
              imageRatio={block.imageRatio}
              caption={block.caption}
            />
          );
        }
        return null;
      })}

      <div className={styles.footer}>
        <Link href="/works" className={styles.back}>
          &lt; WORKS 一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
