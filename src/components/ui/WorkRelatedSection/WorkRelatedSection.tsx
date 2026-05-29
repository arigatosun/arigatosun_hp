import ServiceCaseStudies from '@/components/ui/ServiceCaseStudies';
import type { ServiceCaseStudy } from '@/types/service';
import type { WorkItem } from '@/types/work';

type WorkRelatedSectionProps = {
  works: readonly WorkItem[];
};

/**
 * 他実績への誘導セクション。
 * 見た目を SERVICE ページの実績・事例 (ServiceCaseStudies) と完全に揃えるため、
 * WorkItem を ServiceCaseStudy に変換して同コンポーネントに委譲する。
 */
export default function WorkRelatedSection({
  works,
}: WorkRelatedSectionProps) {
  const caseStudies: ServiceCaseStudy[] = works.map((w) => ({
    id: w.id,
    client: w.client,
    // SERVICE ページ側と同じ整形 (\n 除去 / | 後ろに半角)
    text: w.title.replace(/\n/g, '').replace(/\|/g, '| '),
    thumbnail: w.image,
  }));

  return <ServiceCaseStudies caseStudies={caseStudies} />;
}
