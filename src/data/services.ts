// このファイルは将来 CMS / API から取得するデータの一時的な静的ソース
import type { ServiceCardData } from '@/types/service';

// bgImage: 背景画像。null の間は Figma 同様グレープレースホルダー表示。
// 画像が用意できたら各カードの bgImage にパスを入れるだけで差し替わる。
export const SERVICE_CARDS: readonly ServiceCardData[] = [
  {
    id: 'ai-dev',
    category: 'AI / DEVELOPMENT',
    categoryLabel: 'AI・開発',
    title: 'AI / DEVELOPMENT',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    viewLabel: 'VIEW AI / DEVELOPMENT >',
    bgImage: null,
  },
  {
    id: 'design-branding',
    category: 'DESIGN / BRANDING',
    categoryLabel: 'デザイン・ブランディング',
    title: 'DESIGN / BRANDING',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    viewLabel: 'VIEW DESIGN / BRANDING >',
    bgImage: null,
  },
  {
    id: 'ip-creative',
    category: 'IP / CREATIVE',
    categoryLabel: 'IP・クリエイティブ',
    title: 'IP / CREATIVE',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    viewLabel: 'VIEW IP / CREATIVE >',
    bgImage: null,
  },
] as const;

// TOP の ServiceSection 左メニュー — クリックで各サービス詳細ページへ遷移
export const SERVICE_MENU_ITEMS = [
  { label: '・AI / DEVELOPMENT >', href: '/service/ai-dev' },
  { label: '・DESIGN / BRANDING >', href: '/service/design-branding' },
  { label: '・IP / CREATIVE >', href: '/service/ip-creative' },
] as const;
