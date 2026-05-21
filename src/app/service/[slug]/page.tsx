import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServiceDetailHero from '@/components/ui/ServiceDetailHero';
import ServicePromiseGrid from '@/components/ui/ServicePromiseGrid';
import ServiceConceptBlock from '@/components/ui/ServiceConceptBlock';
import ServiceScopePills from '@/components/ui/ServiceScopePills';
import ServiceFlowSteps from '@/components/ui/ServiceFlowSteps';
import GlowImage from '@/components/ui/GlowImage';
import ServiceCaseStudies from '@/components/ui/ServiceCaseStudies';
import ServiceCrossLinks from '@/components/ui/ServiceCrossLinks';
import {
  SERVICE_DETAIL,
  SERVICE_DETAIL_SLUGS,
  SERVICE_NAV,
} from '@/data/service-detail';
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
  return { title: data ? data.titleEn : 'SERVICE' };
}

export default async function ServiceDetailPage({ params }: PageParams) {
  const { slug } = await params;
  const data = SERVICE_DETAIL[slug];
  if (!data) notFound();

  const crossLinks = SERVICE_NAV.filter((item) => item.slug !== slug);

  return (
    <div className={styles.page}>
      <ServiceDetailHero
        slug={data.slug}
        titleEn={data.titleEn}
        titleJa={data.titleJa}
        quote={data.quote}
        description={data.description}
        heroImage={data.heroImage}
      />

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
        >
          {concept.visual.kind === 'image' && (
            <GlowImage
              src={concept.visual.src}
              alt={concept.visual.alt}
              width={concept.visual.width}
              height={concept.visual.height}
              mask={concept.visual.mask}
              overlays={concept.visual.overlays}
            />
          )}
          {concept.visual.kind === 'pills' && (
            <ServiceScopePills rows={concept.visual.rows} />
          )}
          {concept.visual.kind === 'steps' && (
            <ServiceFlowSteps items={concept.visual.items} />
          )}
        </ServiceConceptBlock>
      ))}

      {data.caseStudies.length > 0 && (
        <ServiceCaseStudies caseStudies={data.caseStudies} />
      )}

      <ServiceCrossLinks items={crossLinks} />
    </div>
  );
}
