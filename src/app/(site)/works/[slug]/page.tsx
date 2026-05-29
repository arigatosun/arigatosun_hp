import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getAllWorks, getWorkBySlug } from '@/data/works';
import { getWorkDetailBySlug } from '@/data/works-detail';
import WorkDetailHero from '@/components/ui/WorkDetailHero';
import WorkLeadBlock from '@/components/ui/WorkLeadBlock';
import WorkTextSection from '@/components/ui/WorkTextSection';
import WorkNamingCard from '@/components/ui/WorkNamingCard';
import WorkParagraph from '@/components/ui/WorkParagraph';
import WorkShowcaseCard from '@/components/ui/WorkShowcaseCard';
import WorkImageGrid from '@/components/ui/WorkImageGrid';
import WorkMockupCard from '@/components/ui/WorkMockupCard';
import WorkCaption from '@/components/ui/WorkCaption';
import WorkDivider from '@/components/ui/WorkDivider';
import WorkCreditList from '@/components/ui/WorkCreditList';
import WorkRelatedSection from '@/components/ui/WorkRelatedSection';
import WorkArchive from '@/components/ui/WorkArchive';
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

// ブロック間の上余白（Figma 実測 px・1920基準）を fluid な margin-top に変換。
// spGap が指定されればその値を clamp min に使い、SP の見た目を Figma 実測に合わせる。
function gapStyle(gap: number, spGap?: number) {
  const min = spGap ?? gap * 0.42;
  return {
    marginTop: `clamp(${min.toFixed(1)}px, ${(gap / 19.2).toFixed(3)}vw, ${gap}px)`,
  };
}

export default async function WorkDetailPage({ params }: PageParams) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) notFound();

  const detail = await getWorkDetailBySlug(slug);
  const works = await getAllWorks();
  const relatedWorks = works.filter((item) => item.id !== slug).slice(0, 3);

  // パターンB（アーカイブ）はスライダーカードのループ構成
  if (detail && detail.pattern === 'archive') {
    return (
      <div className={styles.page}>
        <WorkArchive
          lead={detail.lead}
          entries={detail.entries}
          relatedWorks={relatedWorks}
        />
      </div>
    );
  }

  // パターンA（詳細）はブロック積み上げ構成
  return (
    <div className={styles.page}>
      {detail && <WorkDetailHero hero={detail.hero} />}

      {detail?.blocks.map((block, index) => {
        let node: ReactNode = null;
        if (block.type === 'lead') {
          node = (
            <WorkLeadBlock
              heading={block.heading}
              subheading={block.subheading}
              body={block.body}
            />
          );
        } else if (block.type === 'textSection') {
          node = (
            <WorkTextSection
              level={block.level}
              heading={block.heading}
              body={block.body}
            />
          );
        } else if (block.type === 'namingCard') {
          node = <WorkNamingCard rows={block.rows} spImage={block.spImage} />;
        } else if (block.type === 'paragraph') {
          node = <WorkParagraph body={block.body} />;
        } else if (block.type === 'showcaseCard') {
          node = (
            <WorkShowcaseCard
              background={block.background}
              card={block.card}
              spCard={block.spCard}
              graphic={block.graphic}
            />
          );
        } else if (block.type === 'imageGrid') {
          node = (
            <WorkImageGrid
              images={block.images}
              imageRatio={block.imageRatio}
              caption={block.caption}
              cardHeight={block.cardHeight}
              blur={block.blur}
              spImages={block.spImages}
              spImageRatio={block.spImageRatio}
              spCardHeight={block.spCardHeight}
              spGridCols={block.spGridCols}
              spBlur={block.spBlur}
            />
          );
        } else if (block.type === 'mockupCard') {
          node = (
            <WorkMockupCard
              src={block.src}
              w={block.w}
              h={block.h}
              sp={block.sp}
              spSrc={block.spSrc}
              spW={block.spW}
              spH={block.spH}
            />
          );
        } else if (block.type === 'caption') {
          node = <WorkCaption text={block.text} />;
        } else if (block.type === 'divider') {
          node = <WorkDivider />;
        } else if (block.type === 'creditList') {
          node = <WorkCreditList groups={block.groups} />;
        } else if (block.type === 'relatedWorks') {
          node = <WorkRelatedSection works={relatedWorks} />;
        }

        return (
          <div key={index} style={gapStyle(block.gap, block.spGap)}>
            {node}
          </div>
        );
      })}
    </div>
  );
}
