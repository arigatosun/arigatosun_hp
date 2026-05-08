// このファイルは将来 CMS / API から取得するデータの一時的な静的ソース
import type { ServiceCardData } from '@/types/service';

export const SERVICE_CARDS: readonly ServiceCardData[] = [
  {
    id: 'ai-dev',
    category: 'AI / DEVELOPMENT',
    categoryLabel: 'AI・開発',
    title: 'AI / DEVELOPMENT',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    viewLabel: 'VIEW AI / DEVELOPMENT >',
    bgImage: '/images/sections/service/bg-card.png',
  },
  {
    id: 'design-branding',
    category: 'DESIGN / BRANDING',
    categoryLabel: 'デザイン・ブランディング',
    title: 'DESIGN / BRANDING',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    viewLabel: 'VIEW DESIGN / BRANDING >',
    bgImage: '/images/sections/service/bg-card.png',
  },
  {
    id: 'ip-creative',
    category: 'IP / CREATIVE',
    categoryLabel: 'IP・クリエイティブ',
    title: 'IP / CREATIVE',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    viewLabel: 'VIEW IP / CREATIVE >',
    bgImage: '/images/sections/service/bg-card.png',
  },
] as const;

export const SERVICE_MENU_ITEMS = [
  '· AI / DEVELOPMENT >',
  '· DESIGN / BRANDING >',
  '· IP / CREATIVE >',
] as const;
