/** 日付を「2026.10/10」形式にフォーマット（既存サイト UI の表記に合わせる）。 */
export function formatNewsDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}/${day}`;
}

/** 公開記事の URL を組み立てる。`/news/[year]/[slug]`。 */
export function newsDetailHref(year: number, slug: string): string {
  return `/news/${year}/${slug}`;
}
