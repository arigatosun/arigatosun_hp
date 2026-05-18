import WorksCard from '@/components/ui/WorksCard';
import WorksSidebar from '@/components/ui/WorksSidebar';
import WorksPagination from '@/components/ui/WorksPagination';
import { WORKS_DATA } from '@/data/works';
import styles from './WorksListSection.module.scss';

export default function WorksListSection() {
  // Figma の /works ページは 2 列 × 4 行 = 8 件表示
  const cards = WORKS_DATA.slice(0, 8);

  return (
    <section className={styles.section}>
      <div className={styles.layout}>
        <WorksSidebar active="ALL" />

        <div className={styles.content}>
          <div className={styles.grid}>
            {cards.map((work) => (
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
        </div>
      </div>

      {/* Figma: ページ全幅で中央配置（sidebar の下まで広げる） */}
      <div className={styles.paginationWrap}>
        <WorksPagination currentPage={1} totalPages={2} />
      </div>
    </section>
  );
}
