// このファイルは将来 CMS / API から取得するデータの一時的な静的ソース
import type { WorkItem } from '@/types/work';

export const WORKS_DATA: readonly WorkItem[] = [
  {
    id: 'work-1',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもら\nえるカタチへ。|最優秀賞から生まれたキャラクター\nデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/works-1.png',
    imageWidth: 868,
    imageHeight: 675,
  },
  {
    id: 'work-2',
    client: '全日本漬物協同組合連合会',
    title: 'ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。',
    details: [
      { label: 'AI / D：', value: 'プロジェクトマネジメント、システム実装' },
      { label: 'D / B：', value: 'ディレクション、ロゴデザイン' },
      { label: 'IP / C：', value: 'キャラクター設計' },
    ],
    term: '2024.7 - 2024.10',
    image: '/images/sections/works/works-1.png',
    imageWidth: 868,
    imageHeight: 675,
  },
  {
    id: 'work-3',
    client: '全日本漬物協同組合連合会',
    title: 'ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。',
    details: [
      { label: 'AI / D：', value: 'プロジェクトマネジメント、システム実装' },
      { label: 'D / B：', value: 'ディレクション、ロゴデザイン' },
      { label: 'IP / C：', value: 'キャラクター設計' },
    ],
    term: '2024.7 - 2024.10',
    image: '/images/sections/works/works-1.png',
    imageWidth: 868,
    imageHeight: 675,
  },
] as const;
