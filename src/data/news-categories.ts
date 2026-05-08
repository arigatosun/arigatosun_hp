// このファイルは将来 CMS / API から取得するデータの一時的な静的ソース
import type { NewsCategory } from '@/types/wordpress';

export const NEWS_CATEGORIES: readonly NewsCategory[] = [
  { label: '・ALL >', value: 'all', id: 0 },
  { label: '・INFORMATION >', value: 'information', id: 0 },
  { label: '・EVENTS >', value: 'events', id: 0 },
  { label: '・PRESS >', value: 'press', id: 0 },
] as const;
