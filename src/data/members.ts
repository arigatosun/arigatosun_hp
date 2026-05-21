// このファイルは将来 CMS / API から取得するデータの一時的な静的ソース
import type { Member } from '@/types/member';

// 型は @/types/member に集約。後方互換のため再エクスポート。
export type { Member, MemberSocial, MemberProject } from '@/types/member';

export const members: Member[] = [
  {
    slug: 'shuto-nakamura',
    name: 'SHUTO NAKAMURA',
    role: 'CEO',
    photo: '/images/team/shuto-nakamura.webp',
    photoColor: '/images/team/shuto-nakamura-color.webp',
    catchphrase: '「できない理由」をゼロにする。',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    career:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    social: {
      instagram: 'https://www.instagram.com/',
      x: 'https://x.com/',
    },
    projects: [
      { title: 'Project 1', slug: 'project-1' },
      { title: 'Project 2', slug: 'project-2' },
      { title: 'Project 3', slug: 'project-3' },
      { title: 'Project 4', slug: 'project-4' },
      { title: 'Project 5', slug: 'project-5' },
    ],
    // Phase 5: Figma 準拠 ABOUT/MEMBER 詳細ページ用
    roleJp: '代表社員',
    quote: '関わる人へ想像以上の価値を提供し続け、唯一無二の存在であれ。',
    introParagraphs: [
      '世は大AI時代。',
      '人が当たり前に価値を出してきたものが、次々と代替されていく。',
      '私はこの時代を、人の価値そのものが問い直される時代だと捉えています。',
      'だからこそ私は、人間として証明したい。',
      'AIではできないことを探して人がやる、という受け身の姿勢ではなく、進化し続けるAIを操縦し、最先端で人にしか下せない意思決定を積み重ねていく。',
      'それが、これからの時代の人間のあり方だと考えています。',
      'アリガトサンは、モノづくりを通してそれを証明する会社です。',
      '人のこだわりや体温を映したものを届け続けることで、',
      '関わる人にとって想像を超える価値を提供し、唯一無二の存在であることを誓います。',
    ],
  },
  {
    slug: 'ryo-yoshikawa',
    name: 'RYO YOSHIKAWA',
    role: 'CTO',
    photo: '/images/team/ryo-yoshikawa.webp',
    photoColor: '/images/team/ryo-yoshikawa-color.webp',
    catchphrase: 'テクノロジーで未来を切り拓く。',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    career:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    social: {
      x: 'https://x.com/',
    },
    projects: [
      { title: 'Project 1', slug: 'project-1' },
      { title: 'Project 2', slug: 'project-2' },
      { title: 'Project 3', slug: 'project-3' },
    ],
  },
  {
    slug: 'katsuya-takahashi',
    name: 'KATSUYA TAKAHASHI',
    role: 'LEAD ENGINEER',
    photo: '/images/team/katsuya-takahashi.webp',
    photoColor: '/images/team/katsuya-takahashi-color.webp',
    catchphrase: 'コードに魂を込める。',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    career:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    social: {
      instagram: 'https://www.instagram.com/',
    },
  },
  {
    slug: 'daichi-nakata',
    name: 'DAICHI NAKATA',
    role: 'ENGINEER',
    photo: '/images/team/daichi-nakata.webp',
    photoColor: '/images/team/daichi-nakata-color.webp',
    catchphrase: '最高の体験を、最高の技術で。',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    career:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
  },
  {
    slug: 'hideya-mifuji',
    name: 'HIDEYA MIFUJI',
    role: 'ENGINEER',
    photo: '/images/team/hideya-mifuji.webp',
    photoColor: '/images/team/hideya-mifuji-color.webp',
    catchphrase: '細部にこそ、本質が宿る。',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    career:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    social: {
      x: 'https://x.com/',
    },
  },
  {
    slug: 'yugo-nishimoto',
    name: 'YUGO NISHIMOTO',
    role: 'CDO / DESIGN DIRECTOR',
    photo: '/images/team/yugo-nishimoto.webp',
    photoColor: '/images/team/yugo-nishimoto-color.webp',
    catchphrase: 'デザインで世界を変える。',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    career:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    social: {
      instagram: 'https://www.instagram.com/',
      x: 'https://x.com/',
    },
  },
  {
    slug: 'hyouga-hiromori',
    name: 'HYOUGA HIROMORI',
    role: 'CCO / KUSOMEGANE',
    photo: '/images/team/hyouga-hiromori.webp',
    photoColor: '/images/team/hyouga-hiromori-color.webp',
    catchphrase: '常識を壊し、新しい価値を創る。',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    career:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    social: {
      instagram: 'https://www.instagram.com/',
    },
  },
  {
    slug: 'airu-matsuo',
    name: 'AIRU MATSUO',
    role: 'CREATIVE ENGINEER',
    photo: '/images/team/airu-matsuo.webp',
    photoColor: '/images/team/airu-matsuo-color.webp',
    catchphrase: 'クリエイティブとテクノロジーの架け橋。',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    career:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
  },
  {
    slug: 'koushi-tsuchiga',
    name: 'KOUSHI TSUCHIGA',
    role: 'CORPORATE OPERATIONS',
    photo: '/images/team/koushi-tsuchiga.webp',
    photoColor: '/images/team/koushi-tsuchiga-color.webp',
    catchphrase: '組織の力を最大化する。',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    career:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
  },
  {
    slug: 'arigato-kun',
    name: 'ARIGATO KUN',
    role: 'CHARACTER',
    photo: '/images/team/arigato-kun.webp',
    photoColor: '/images/team/arigato-kun-color.webp',
    catchphrase: 'アリガトサンの太陽キャラクター。',
    description:
      'アリガトサンを象徴するマスコットキャラクター。妥協なき愛と感謝の光で、関わるすべての人を照らす存在。',
    career:
      'アリガトサンと共に世界へ羽ばたく、唯一無二の存在。',
  },
];

export function getMemberBySlug(slug: string): Member | undefined {
  return members.find((m) => m.slug === slug);
}

export function getAllMemberSlugs(): string[] {
  return members.map((m) => m.slug);
}
