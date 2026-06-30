'use client';

import { useState } from 'react';
import SectionTitle from '@/components/ui/SectionTitle';
import InterviewCard from '@/components/ui/InterviewCard';
import WorksPagination from '@/components/ui/WorksPagination';
import { INTERVIEWS } from '@/data/interviews';
import styles from './page.module.scss';

// 1ページあたり最大9枚（3列×3行）。それ以降は NEXT で次ページ。
const PER_PAGE = 9;

export default function InterviewList() {
  const totalPages = Math.max(1, Math.ceil(INTERVIEWS.length / PER_PAGE));
  const [page, setPage] = useState(1);
  const current = Math.min(page, totalPages);
  const items = INTERVIEWS.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <div className={styles.page}>
      <SectionTitle
        src="/images/sections/interview/title-logo.png"
        alt="インタビュー"
        width={259}
        height={42}
        label="CLIENT INTERVIEW"
        as="h1"
        className={styles.title}
      />

      <ul className={styles.grid}>
        {items.map((item, i) => (
          <li key={(current - 1) * PER_PAGE + i}>
            <InterviewCard item={item} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <WorksPagination
            currentPage={current}
            totalPages={totalPages}
            onBack={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      )}
    </div>
  );
}
