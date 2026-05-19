'use client';

import { useState } from 'react';
import WorksCard from '@/components/ui/WorksCard';
import WorksSidebar from '@/components/ui/WorksSidebar';
import WorksPagination from '@/components/ui/WorksPagination';
import { WORKS_DATA } from '@/data/works';
import styles from './WorksListSection.module.scss';

// Figma の /works ページは 2 列 × 4 行 = 8 件 / ページ
const PER_PAGE = 8;

export default function WorksListSection() {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(WORKS_DATA.length / PER_PAGE));
  const cards = WORKS_DATA.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ページ送り：NEXT/BACK はページ下部にあるため、切替後は上部の新しいカードへスクロールを戻す
  const goToPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0 });
  };

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
        <WorksPagination
          currentPage={page}
          totalPages={totalPages}
          onBack={() => goToPage(Math.max(1, page - 1))}
          onNext={() => goToPage(Math.min(totalPages, page + 1))}
        />
      </div>
    </section>
  );
}
