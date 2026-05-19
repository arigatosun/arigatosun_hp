import WorksCard from '@/components/ui/WorksCard';
import type { WorkItem } from '@/types/work';
import styles from './WorkRelatedSection.module.scss';

type WorkRelatedSectionProps = {
  works: readonly WorkItem[];
};

export default function WorkRelatedSection({
  works,
}: WorkRelatedSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true" />
        <div className={styles.headings}>
          <h2 className={styles.title}>実績・事例</h2>
          <p className={styles.subtitle}>DESIGN &amp; BRANDING SCOPE</p>
        </div>
      </div>

      <div className={styles.cards}>
        {works.map((work) => (
          <WorksCard
            key={work.id}
            client={work.client}
            title={work.title}
            image={work.image}
            imageWidth={work.imageWidth}
            imageHeight={work.imageHeight}
            href={`/works/${work.id}`}
          />
        ))}
      </div>
    </section>
  );
}
