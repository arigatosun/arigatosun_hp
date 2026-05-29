import type { MetadataRoute } from 'next';
import { getAllWorks } from '@/data/works';
import { SERVICE_DETAIL_SLUGS } from '@/data/service-detail';
import { getAllMemberSlugs } from '@/data/members';
import { getPublishedNewsParams } from '@/lib/news/queries';

const BASE_URL = 'https://arigatosun.com';

/**
 * サイトマップ。静的ページ + 動的詳細（service / works / member / news）を列挙する。
 * news / works のデータ取得に失敗した場合は静的分のみで返す（ビルドを止めない）。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/service`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/works`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/news`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  for (const slug of SERVICE_DETAIL_SLUGS) {
    entries.push({
      url: `${BASE_URL}/service/${slug}`,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  for (const slug of getAllMemberSlugs()) {
    entries.push({
      url: `${BASE_URL}/about/member/${slug}`,
      changeFrequency: 'monthly',
      priority: 0.4,
    });
  }

  try {
    const works = await getAllWorks();
    for (const w of works) {
      entries.push({
        url: `${BASE_URL}/works/${w.id}`,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  } catch {
    /* works 取得失敗時は静的分のみ */
  }

  try {
    const news = await getPublishedNewsParams();
    for (const n of news) {
      entries.push({
        url: `${BASE_URL}/news/${n.year}/${n.slug}`,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  } catch {
    /* news 取得失敗時は静的分のみ */
  }

  return entries;
}
