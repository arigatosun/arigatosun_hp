// 公開側で使うニュース関連の型。Supabase の Database 型から派生。
// 旧 src/types/wordpress.ts の置き換え。

import type { Database, Json } from './supabase';

type NewsRow = Database['public']['Tables']['news']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

export type Category = Pick<CategoryRow, 'id' | 'slug' | 'label' | 'display_order'>;

/** ニュース一覧用の軽量データ。本文を含まない。 */
export type NewsListItem = Pick<
  NewsRow,
  'id' | 'slug' | 'slug_year' | 'title' | 'thumbnail_url' | 'published_at'
> & {
  category: Pick<CategoryRow, 'slug' | 'label'> | null;
};

/** ニュース詳細用。本文 (TipTap JSON) を含む。 */
export type NewsDetail = NewsListItem & {
  content: Json;
};
