import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServiceDetailHero from '@/components/ui/ServiceDetailHero';
import ServiceCreatorProfile from '@/components/ui/ServiceCreatorProfile';
import ServicePromiseGrid from '@/components/ui/ServicePromiseGrid';
import ServiceConceptBlock from '@/components/ui/ServiceConceptBlock';
import ServiceScopePills from '@/components/ui/ServiceScopePills';
import ServiceFlowSteps from '@/components/ui/ServiceFlowSteps';
import ServicePhaseSteps from '@/components/ui/ServicePhaseSteps';
import ServiceCallouts from '@/components/ui/ServiceCallouts';
import ServiceOrgBubbles from '@/components/ui/ServiceOrgBubbles';
import GlowImage from '@/components/ui/GlowImage';
import ServiceCaseStudies from '@/components/ui/ServiceCaseStudies';
import ServiceCrossLinks from '@/components/ui/ServiceCrossLinks';
import {
  SERVICE_DETAIL,
  SERVICE_DETAIL_SLUGS,
  SERVICE_NAV,
} from '@/data/service-detail';
import { getAllWorks } from '@/data/works';
import type { ServiceCaseStudy } from '@/types/service';
import styles from './page.module.scss';

type PageParams = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return SERVICE_DETAIL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const data = SERVICE_DETAIL[slug];
  if (!data) return { title: 'SERVICE' };
  const description = [data.titleJa, data.quote]
    .filter(Boolean)
    .join(' ')
    .replace(/\n|\|\|?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
  return {
    title: data.titleEn,
    description,
    openGraph: { title: `${data.titleEn} | 株式会社アリガトサン`, description },
  };
}

export default async function ServiceDetailPage({ params }: PageParams) {
  const { slug } = await params;
  const data = SERVICE_DETAIL[slug];
  if (!data) notFound();

  const crossLinks = SERVICE_NAV.filter((item) => item.slug !== slug);

  // 事例 3 枠は SERVICE 全ページで Works データから取り出す（現状は記入がある先頭 3 件）。
  // 将来 Works が増えたら slice → シャッフル / 抽選ロジックに差し替えれば各ページが自動で別 3 件になる。
  const allWorks = await getAllWorks();
  const caseStudies: ServiceCaseStudy[] = allWorks.slice(0, 3).map((w) => ({
    id: w.id,
    client: w.client,
    // works の title に含まれる \n（カード内表示用の改行）は実績カードでは除去。
    // また「|」の後ろに半角空白を入れて視認性を確保（前後の文を区切る区切り記号として）。
    text: w.title.replace(/\n/g, '').replace(/\|/g, '| '),
    thumbnail: w.image,
  }));

  return (
    <div className={styles.page}>
      <ServiceDetailHero
        slug={data.slug}
        titleEn={data.titleEn}
        titleJa={data.titleJa}
        quote={data.quote}
        subQuote={data.subQuote}
        description={data.description}
        heroImage={data.heroImage}
        heroSlides={data.heroSlides}
      />

      {data.creatorProfile && (
        <ServiceCreatorProfile
          avatar={data.creatorProfile.avatar}
          title={data.creatorProfile.title}
          description={data.creatorProfile.description}
          snsLinks={data.creatorProfile.snsLinks}
        />
      )}

      {data.promises?.map((section) => (
        <ServicePromiseGrid
          key={section.id}
          id={section.id}
          title={section.title}
          subtitle={section.subtitle}
          items={section.items}
        />
      ))}

      {data.concepts.map((concept) => (
        <ServiceConceptBlock
          key={concept.id}
          id={concept.id}
          title={concept.title}
          subtitle={concept.subtitle}
          body={concept.body}
          bodyTracking={concept.bodyTracking}
          bodyBreakAbove1512={concept.bodyBreakAbove1512}
          variant={concept.visual.kind === 'phases' ? 'phases' : 'default'}
          // PROCESS 系（steps / phases）セクションは PC で左カラムを sticky 固定にする
          // （AI ページの進め方 = steps と同じ挙動を IP の phases にも適用）
          stickyText={
            concept.visual.kind === 'steps' || concept.visual.kind === 'phases'
          }
        >
          {concept.visual.kind === 'image' && (
            <GlowImage
              src={concept.visual.src}
              alt={concept.visual.alt}
              width={concept.visual.width}
              height={concept.visual.height}
              spSrc={concept.visual.spSrc}
              spWidth={concept.visual.spWidth}
              spHeight={concept.visual.spHeight}
              mask={concept.visual.mask}
              overlays={concept.visual.overlays}
              compactSp={concept.visual.compactSp}
            />
          )}
          {concept.visual.kind === 'pills' && (
            <ServiceScopePills rows={concept.visual.rows} />
          )}
          {concept.visual.kind === 'steps' && (
            <ServiceFlowSteps items={concept.visual.items} />
          )}
          {concept.visual.kind === 'phases' && (
            <ServicePhaseSteps items={concept.visual.items} />
          )}
          {concept.visual.kind === 'callouts' && (
            <ServiceCallouts
              items={concept.visual.items}
              image={concept.visual.image}
            />
          )}
          {concept.visual.kind === 'orgBubbles' && (
            <ServiceOrgBubbles bubbles={concept.visual.bubbles} />
          )}
        </ServiceConceptBlock>
      ))}

      {caseStudies.length > 0 && (
        <ServiceCaseStudies caseStudies={caseStudies} />
      )}

      <ServiceCrossLinks items={crossLinks} />
    </div>
  );
}
