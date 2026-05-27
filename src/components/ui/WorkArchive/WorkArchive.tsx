import { Fragment } from 'react';
import WorkArchiveEntry from '@/components/ui/WorkArchiveEntry';
import WorkRelatedSection from '@/components/ui/WorkRelatedSection';
import type { WorkArchiveEntry as ArchiveEntry, WorkItem } from '@/types/work';
import styles from './WorkArchive.module.scss';

type WorkArchiveProps = {
  lead: { heading: string; body: string[] };
  entries: ArchiveEntry[];
  relatedWorks: readonly WorkItem[];
};

export default function WorkArchive({
  lead,
  entries,
  relatedWorks,
}: WorkArchiveProps) {
  return (
    <div className={styles.archive}>
      <header className={styles.header}>
        <h1 className={styles.leadHeading}>{lead.heading}</h1>
        <span className={styles.divider} aria-hidden="true" />
        <p className={styles.leadBody}>
          {lead.body.map((line, index) => (
            <Fragment key={index}>
              {index > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      </header>

      <div className={styles.entries}>
        {entries.map((entry, index) => (
          <WorkArchiveEntry
            key={index}
            heading={entry.heading}
            body={entry.body}
            credit={entry.credit}
            images={entry.images}
            extended={entry.extended}
            cardAspect={entry.cardAspect}
          />
        ))}
      </div>

      <div className={styles.related}>
        <WorkRelatedSection works={relatedWorks} />
      </div>
    </div>
  );
}
