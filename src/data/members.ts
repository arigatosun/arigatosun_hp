// このファイルは将来 CMS / API から取得するデータの一時的な静的ソース
import type { Member } from '@/types/member';

// 型は @/types/member に集約。後方互換のため再エクスポート。
export type { Member, MemberSocial, MemberProject } from '@/types/member';

// 原データ（hidden 含む）。public 用の `members` / `getMemberBySlug` 等は
// 下記で hidden を除外したものを export するので、外から使うときは hidden を考慮しなくて OK。
const allMembers: Member[] = [
  {
    slug: 'shuto-nakamura',
    name: 'SHUTO NAKAMURA',
    role: 'CEO',
    photo: '/images/team/shuto-nakamura.webp',
    photoColor: '/images/team/shuto-nakamura-color.webp',
    catchphrase: '「できない理由」をゼロにする。',
    description: '人が自分の可能性を信じ、未来づくりに熱中できる社会をつくる。',
    // Figma(3467:95601) は理念のみで 経歴・プロジェクトを持たないため非表示
    career: '',
    projects: [],
    // Figma 3467:95601 準拠
    roleJp: '代表取締役 (CEO)',
    quote: '人が自分の可能性を信じ、未来づくりに熱中できる社会をつくる。',
    introParagraphs: [
      '今、多くの会社や現場では、本当はもっと挑戦したい人たちが、日々の業務、情報整理、確認作業、意思決定の遅れに時間を奪われています。',
      '経営者も、現場の人も、守りの仕事に追われるほど、本来向き合うべき構想や、大切な人との時間から離れてしまう。',
      '僕たちは、その時間を取り戻し、より良い未来に向かうための時間に変えていきます。',
      '​',
      'AIやシステム開発は、目的ではなく手段です。人の仕事を奪うものではなく、人がもっと人らしく、もっと創造的に、もっと大きな未来へ向かうための道具だと考えています。',
      '僕たちは、技術の会社である前に、可能性を信じる会社でありたい。',
      '目の前の人が「まだやれる」と思える瞬間を増やし、その挑戦が次の誰かの希望になる。',
      'そんなありがとうの循環を、社会に広げていきます。',
    ],
    // Figma は FACEBOOK のみ
    social: {
      facebook: 'https://www.facebook.com/xxore.happy.xx',
    },
  },
  {
    slug: 'koushi-tsuchiga',
    name: 'KOUSHI TSUCHIGA',
    role: 'EXECUTIVE OFFICER',
    photo: '/images/team/koushi-tsuchiga.webp',
    photoColor: '/images/team/koushi-tsuchiga-color.webp',
    catchphrase: '組織の力を最大化する。',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    career:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
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
    role: 'CPO / ENGINEER',
    photo: '/images/team/daichi-nakata.webp',
    photoColor: '/images/team/daichi-nakata-color.webp',
    catchphrase: '最高の体験を、最高の技術で。',
    description:
      'AIで人生が変わる景色を、同じ目線で。',
    // Figma 3462:94858 準拠
    roleJp: '最高人事責任者 (CPO) / ENGINEER',
    // SP は「、」で改行（PC は 1 行）。セグメント配列にすると間に SP のみ <br> が入る
    quote: ['AIで人生が変わる景色を、', '同じ目線で。'],
    introParagraphs: [
      'もともと、人に何かを教えるのが好きで、教師を志していました。巡り合わせでたどり着いたのは、AIでものをつくる世界。',
      'それでも、根っこにある「人と向き合いたい」という想いは、今も少しも変わっていません。',
      '正直に言うと、僕も最初は「自分には無理だ」と思っていた側でした。',
      'プログラムの経験もほとんどなく、できない理由ばかりが頭をよぎって、苦しかった時期もあります。それでも諦めずにAIと向き合い続けたある日、自分の手で思い描いたものが、画面の中で動いた。その瞬間、「無理だ」と決めつけていた世界の見え方が、まるごと変わったんです。',
      'あの一瞬が、教えてくれました。人は、誰かに強いられてではなく、自分の内側から湧き上がる「やってみたい」に火がついた時、想像もしなかった場所までたどり着ける。',
      'この確信が、いまの僕の真ん中にあります。',
      '立ち止まりそうになる日も、ここに立ち返る。だからこそ、一日の小さな感情まで大切にしながら、毎日を全力で生きられています。',
      '​',
      'だから僕は信じています。AIは、人から何かを奪う道具じゃない。',
      'むしろ、一人ひとりの「やりたい」を解き放ち、これまで表に出せなかった個性を引き出して、人生の選択肢そのものを広げてくれる。そして人もまた、数字や成果で測る相手ではなく、自分の意志を持った一人として向き合いたい。',
      '出会えたすべての人への感謝と敬意——それが、僕がものをつくる手を動かしながら、仲間と向き合う役割も担う理由です。',
      'かつての僕と同じ、未経験から始めた仲間が、自分の手で何かを形にしていく。その瞬間に立ち会えること、少し照れたように笑うその顔を見られることが、僕は何よりも嬉しい。',
      'その景色を、すぐ隣で、一緒に見にいきたい。',
      'それが、僕の変わらない想いです。',
    ],
    career:
      '2014年、高校を中退し、解体・土木の現場で約2年間を過ごす。\n2016年、起業。2020年に一度休業する。\nその後、基礎から地力をつけ直すため、未経験でエンジニアリング業界へ飛び込み、約2年の修行を経てキャリアを積み直す。\n2023年、創業まもない株式会社アリガトサンへ集結し、現在に至る。\n開発の最前線に立ちながら、人材育成やメンバーとの対話にも携わる。',
    // この Figma ノードには「関わったプロジェクト」が含まれないため、明示的に空にして非表示化
    projects: [],
  },
  {
    slug: 'hideya-mifuji',
    name: 'HIDEYA MIFUJI',
    role: 'ENGINEER',
    hidden: true, // ← 再表示する時は false にするかこの行を削除
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
    role: 'CDO',
    photo: '/images/team/yugo-nishimoto.webp',
    photoColor: '/images/team/yugo-nishimoto-color.webp',
    catchphrase: 'デザインで世界を変える。',
    description: '人が触れるものに、デザインは欠かせない。',
    // Figma 3467:94892 準拠
    roleJp: '最高デザイン責任者 (CDO) / DESIGN DIRECTOR',
    // SP は「、」で改行（PC は 1 行）
    quote: ['人が触れるものに、', 'デザインは欠かせない。'],
    // PC(3467:94892) と SP(3467:94859) で改行（段落区切り）が異なるため出し分け
    introParagraphs: {
      pc: [
        '10代前半の頃、音楽活動を通じてストリートカルチャーに触れたことが、',
        'クリエイティブの世界に身を置くようになった原点です。',
        '以来、デザインや芸術と歩みを共にし、これまでモノづくりと向き合ってきました。',
        '​',
        'テクノロジーによって開発が加速する今だからこそ、私は「AIと人間の適材適所な共創」を大切にしています。AIの可能性を活かしながら、核心部には人間が持つ「泥臭い追求心」や「執着に似たこだわり」を注ぎ込む。',
        'その両方が重なったとき、デザインは単なる装飾を超え、想像以上の景色へ連れて行ってくれると確信しているからです。',
        '心を動かし、愛され続けるモノの背景には、必ず「人間の意志」が宿っている。',
        '人が触れるあらゆるものに、体温のあるデザインを。それが、僕が守り続ける一線です。',
      ],
      sp: [
        '10代前半の頃、音楽活動を通じてストリートカルチャーに触れたことが、',
        'クリエイティブの世界に身を置くようになった原点です。以来、デザインや芸術と歩みを共にし、これまでモノづくりと向き合ってきました。',
        'テクノロジーによって開発が加速する今だからこそ、私は「AIと人間の適材適所な共創」を大切にしています。AIの可能性を活かしながら、核心部には人間が持つ「泥臭い追求心」や「執着に似たこだわり」を注ぎ込む。',
        'その両方が重なったとき、デザインは単なる装飾を超え、想像以上の景色へ連れて行ってくれると確信しているからです。',
        '心を動かし、愛され続けるモノの背景には、必ず「人間の意志」が宿っている。',
        '人が触れるあらゆるものに、体温のあるデザインを。',
        'それが、僕が守り続ける一線です。',
      ],
    },
    // PC は「…運営、」の後で改行、SP は改行なし（各 Figma 準拠）
    career: {
      pc: '2019年大阪芸術大学 デザイン学科を卒業後、デザイン会社に入社。\n2024年に独立し、デザイン事務所「nini design」設立。\n2025年、合同会社アリガトサンに正式参画。\nその他、音楽スタジオ「BEAT AND A WORKS」の立ち上げ・運営、\nアーティスト活動も行う。',
      sp: '2019年大阪芸術大学 デザイン学科を卒業後、デザイン会社に入社。\n2024年に独立し、デザイン事務所「nini design」設立。\n2025年、合同会社アリガトサンに正式参画。\nその他、音楽スタジオ「BEAT AND A WORKS」の立ち上げ・運営、アーティスト活動も行う。',
    },
    // Figma ノードには INSTAGRAM のみ表示のため X は外す
    social: {
      instagram: 'https://www.instagram.com/nishimoto_yugo',
    },
    // この Figma ノードに「関わったプロジェクト」が無いため空にして非表示化
    projects: [],
  },
  {
    slug: 'hyouga-hiromori',
    name: 'HYOUGA HIROMORI',
    role: 'CCO / KUSOMEGANE',
    photo: '/images/team/hyouga-hiromori.webp',
    photoColor: '/images/team/hyouga-hiromori-color.webp',
    catchphrase: '常識を壊し、新しい価値を創る。',
    description: '純度の高い衝動を、社会の光へ。',
    // Figma 3483:96677 準拠
    roleJp: '最高クリエイティブ責任者 (CCO) / KUSOMEGANE',
    quote: '純度の高い衝動を、社会の光へ。',
    introParagraphs: [
      '時代がどれほど進化し、AIという驚異的なツールが標準となったとしても、僕が守り続ける軸は変わりません。',
      '​',
      'クリエイティブを心から愛し、楽しみ、その深淵に没頭すること。ただそれだけです。',
      'ノイズを遮断し、自分の中に宿る個性の純度を極限まで高めていく。その過程で生まれる「どうしてもこれをやりたい!!!!」という執着にも似た熱量こそが、人の心を動かす唯一無二の力になると信じています。',
      '​',
      'どれほど世界が合理化されても、人の魂を震わせるのは、計算された最適解ではなく、誰かが命を削って作り上げた、言葉にならぬ”衝動”です。',
      '​',
      '僕が目指すのは、そんな個の熱量を、社会を動かす温かな価値へと変換し続けること。',
      '自らの意志で選び、描き、形にしたものを、誰かの心の拠り所として還元していく。',
      '​',
      '僕自身も、僕らアリガトサンも。クリエイティブへの敬意、愛、そして没頭の果てに、これからも在り続けます。',
    ],
    career:
      '2019年大阪芸術大学 デザイン学科を卒業後、カーデザイナーとして某車メーカーへ入社。\n「もっと色々なクリエイティブを楽しみたい」という勝手な理由で入社2ヶ月で志願退職し、次の日から別ベンチャーIT会社のデザインディレクターを担いながら、フリーランスクリエイターとしての活動を開始。\n\n2021年、「メガくん」としてSNS活動をスタート。アートワーク×視聴者参加型をバリューにした動画で、約2年で約300本の動画と合計110万人フォロワーを築く。\nEC実装、商品デザイン、メーカー営業と梱包発送管理、SNS集客まで全て独自構築。０コスト＆０リスクベースで物販の全フローを運用。\n大手IPコラボ、テレビ出演、学校講演、イベント出店、個展と、様々なクリエイティブ経験も積み重ねる。\n\n2023年、制作会社「合同会社アリガトサン」を吉川と共同創業者として設立。\n従来のSNS活動を中断し、SNSの知見を活かしたオリジナルIP「KUSOMEGANE©️」の制作と配信を開始。',
    social: {
      instagram: 'https://www.instagram.com/',
    },
    // この Figma ノードに「関わったプロジェクト」が無いため空にして非表示化
    projects: [],
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

// public API: hidden を除外した一覧。MemberSection / detail page など外部はこれを使う。
export const members: Member[] = allMembers.filter((m) => !m.hidden);

export function getMemberBySlug(slug: string): Member | undefined {
  // hidden member は undefined を返して詳細 URL を 404 にする
  return members.find((m) => m.slug === slug);
}

export function getAllMemberSlugs(): string[] {
  // 静的ページ生成対象から hidden を除外
  return members.map((m) => m.slug);
}
