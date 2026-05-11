'use client';

import styles from './WorksPagination.module.scss';

type WorksPaginationProps = {
  currentPage: number;
  totalPages: number;
  onBack?: () => void;
  onNext?: () => void;
};

export default function WorksPagination({
  currentPage,
  totalPages,
  onBack,
  onNext,
}: WorksPaginationProps) {
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <nav className={styles.pagination} aria-label="ページ送り">
      <button
        type="button"
        className={styles.button}
        disabled={isFirst}
        onClick={onBack}
      >
        &lt; BACK
      </button>

      <span className={styles.indicator}>
        {currentPage}/{totalPages}
      </span>

      <button
        type="button"
        className={styles.button}
        disabled={isLast}
        onClick={onNext}
      >
        NEXT &gt;
      </button>
    </nav>
  );
}
