import styles from './StatusBadge.module.scss';

export type DisplayStatus = 'draft' | 'published' | 'scheduled';

interface StatusBadgeProps {
  status: DisplayStatus;
}

// 純粋コンポーネント。「予約公開」の判定 (published_at が未来か) は呼び出し側で行い、
// 結果を `status` プロップに渡す。Date.now() を内部で呼ばないことで
// react-hooks/purity の警告を回避する。
export default function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'draft') {
    return <span className={`${styles.badge} ${styles.draft}`}>下書き</span>;
  }
  if (status === 'scheduled') {
    return <span className={`${styles.badge} ${styles.scheduled}`}>予約公開</span>;
  }
  return <span className={`${styles.badge} ${styles.published}`}>公開中</span>;
}

// 共通ヘルパ。Server Component から呼び、結果を StatusBadge に渡す。
export function resolveDisplayStatus(
  status: 'draft' | 'published',
  publishedAt: string | null,
  nowMs: number,
): DisplayStatus {
  if (status === 'draft') return 'draft';
  if (publishedAt && new Date(publishedAt).getTime() > nowMs) return 'scheduled';
  return 'published';
}
