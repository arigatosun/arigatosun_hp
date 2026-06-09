'use client';

import { useState } from 'react';
import WorksCard from '@/components/ui/WorksCard';
import WorksSidebar, { type WorksFilterKey } from '@/components/ui/WorksSidebar';
import WorksPagination from '@/components/ui/WorksPagination';
import type { WorkItem } from '@/types/work';
import styles from './WorksListSection.module.scss';

// /works ページは 2 列 × 3 行 = 6 件 / ページ
const PER_PAGE = 6;

type WorksListSectionProps = {
  works: readonly WorkItem[];
};

export default function WorksListSection({ works }: WorksListSectionProps) {
  const [active, setActive] = useState<WorksFilterKey>('ALL');
  const [page, setPage] = useState(1);

  // 左サイドバーの選択カテゴリで絞り込み（'ALL' は全件）。
  const filtered =
    active === 'ALL'
      ? works
      : works.filter((work) => work.categories.includes(active));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const cards = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ページ送り：NEXT/BACK はページ下部にあるため、切替後は上部の新しいカードへスクロールを戻す
  const goToPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0 });
  };

  // カテゴリ切替時は 1 ページ目に戻す（絞り込み後の件数が減るため）
  const handleSelect = (key: WorksFilterKey) => {
    setActive(key);
    setPage(1);
  };

  return (
    <section className={styles.section}>
      <div className={styles.layout}>
        <WorksSidebar active={active} onSelect={handleSelect} />

        <div className={styles.content}>
          {cards.length > 0 ? (
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
                  spBreakAtPipe={work.spBreakAtPipe}
                  imagePosition={work.imagePosition}
                />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>このカテゴリの実績は準備中です。</p>
          )}
        </div>
      </div>

      {/* Figma: ページ全幅で中央配置（sidebar の下まで広げる）。1 ページのみの時は非表示 */}
      {totalPages > 1 && (
        <div className={styles.paginationWrap}>
          <WorksPagination
            currentPage={page}
            totalPages={totalPages}
            onBack={() => goToPage(Math.max(1, page - 1))}
            onNext={() => goToPage(Math.min(totalPages, page + 1))}
          />
        </div>
      )}
    </section>
  );
}
