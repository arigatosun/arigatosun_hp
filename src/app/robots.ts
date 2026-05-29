import type { MetadataRoute } from 'next';

const BASE_URL = 'https://arigatosun.com';

/**
 * robots.txt。管理画面・API はクロール不可、それ以外は許可。サイトマップを通知する。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
