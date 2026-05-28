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
    // Figma 2872:56144: 3 行構成（明示的改行）
    description:
      'LLMを活用したWeb・アプリ開発。\n業務を動かすAIエージェントの構築など。\n最先端の技術で、思い描いた理想を確かな形へと実現します。',
    viewLabel: 'VIEW AI / DEVELOPMENT >',
    bgImage: null,
    bgVideo: {
      webm: '/videos/services/ai-dev.webm',
      mp4: '/videos/services/ai-dev.mp4',
    },
  },
  {
    id: 'design-branding',
    category: 'DESIGN / BRANDING',
    categoryLabel: 'デザイン・ブランディング',
    title: 'DESIGN / BRANDING',
    // Figma 2872:56148: 単一段落（自然折返し）
    description:
      '心を動かし、役割を全うするデザインで、一貫したブランド像を設計する。ロゴやVI、Webサイトをはじめ、届けたい価値が宿る、あらゆる接点をカタチにします。',
    viewLabel: 'VIEW DESIGN / BRANDING >',
    bgImage: null,
    bgVideo: {
      webm: '/videos/services/design-branding.webm',
      mp4: '/videos/services/design-branding.mp4',
    },
  },
  {
    id: 'ip-creative',
    category: 'IP / CREATIVE',
    categoryLabel: 'IP・クリエイティブ',
    title: 'IP / CREATIVE',
    // Figma 2872:56152: 2 段落構成（明示的改行）
    description:
      '世界観そのものに命を吹き込み、人の心に残るIPを生み出す。\n創って終わりではなく、届けて、愛されるところまでを設計します。世代を超えて親しまれ、やがて文化として根づくIPを育てます。',
    viewLabel: 'VIEW IP / CREATIVE >',
    bgImage: null,
    bgVideo: {
      webm: '/videos/services/ip-creative.webm',
      mp4: '/videos/services/ip-creative.mp4',
    },
  },
] as const;

// TOP の ServiceSection 左メニュー — クリックで各サービス詳細ページへ遷移
export const SERVICE_MENU_ITEMS = [
  { label: '・AI / DEVELOPMENT >', href: '/service/ai-dev' },
  { label: '・DESIGN / BRANDING >', href: '/service/design-branding' },
  { label: '・IP / CREATIVE >', href: '/service/ip-creative' },
] as const;
