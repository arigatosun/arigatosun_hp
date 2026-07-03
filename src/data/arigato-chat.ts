// アリガトくんチャットページ（/about/member/arigato-kun）の表示テキスト。
// 現状は AI 連携なしのデモ版。文言は将来 CMS / サーバー応答に差し替えられるよう
// コンポーネントに直書きせず、ここへ集約する。

// ── ウェルカム（会話開始前のヒーロー）。Figma node 3640:54935〜54943 準拠 ──
export const WELCOME = {
  overline: 'OFFICIAL CHARACTER',
  name: 'アリガトくん',
  nameEn: '(ARIGATOKUN)',
  // SP のみ「から」の後で改行（PC は1行）。2セグメントで保持し、間に SP 専用改行を入れる。
  catchphrase: ['“ありがとう”の気持ちから', '生まれた、小さな太陽。'],
  // 段落ごとに行配列で保持（Figma の明示的改行を <br> で再現する）。
  // 6行は段落間の空行を入れず連続表示する（1段落で保持）。
  intro: [
    [
      'AI（LLM）の技術で言葉を。デザインで姿をもらって僕は生まれたサン！',
      '正解を出すだけじゃなく、その先の“うれしい”まで届けたい。',
      'そんなアリガトサンの想いを、まんなかに灯しているサン。',
      '僕は、会社のパソコンにも、アリガトサンのオフィスにも、いつだっているサン！',
      '気になることがあったら、なんでも気軽に聞いてほしいサン。',
      'あなたとお話しできるのを、楽しみに待ってるサン！',
    ],
  ],
} as const;

// 入力欄プレースホルダー（Figma node 3902:26757）
export const INPUT_PLACEHOLDER =
  '“気になること”話しかけてみてください。ex.) アリガトサンって何？';

// 下部コピーライト行（Figma node 3902:27063 / 27064）
export const COPYRIGHT = {
  left: 'Arigatosun Inc.',
  right: '© 2026 ARIGATOSUN. ALL RIGHTS RESERVED.',
} as const;

// ── 定型応答（A: FAQ 出し分け版）──
// ※ まだ LLM 連携はしておらず、入力文のキーワードで話題を判定して定型回答を返す。
//   将来 AI 連携（B）時は matchAnswer をサーバー応答（LLM）呼び出しに差し替えるだけでよい。
//   keywords は小文字・部分一致で判定。具体的な話題を先に置き、汎用の「会社」を後ろに置く。
// topic は質問ログの話題分類（classifyTopic）にも流用する。未分類は 'unknown'。
export type FaqTopic =
  | 'greeting'
  | 'recruit'
  | 'service'
  | 'member'
  | 'works'
  | 'contact'
  | 'character'
  | 'company';

export type FaqEntry = {
  topic: FaqTopic;
  keywords: string[];
  answer: string[];
};

export const FAQ: FaqEntry[] = [
  {
    // 挨拶
    topic: 'greeting',
    keywords: ['こんにち', 'こんばん', 'おはよう', 'はじめまして', 'やあ', 'hello', 'hi', 'よろしく', 'どうも', 'ありがと', 'はろー'],
    answer: [
      'こんにちは！アリガトくんだサン🌞',
      'アリガトサンのこと、なんでも聞いてサン！',
      '会社のこと・サービス・実績・メンバー・採用、気になることはあるサン？',
    ],
  },
  {
    // 採用・求人
    topic: 'recruit',
    keywords: ['採用', '求人', '応募', '募集', '働', '仕事', '転職', 'インターン', 'エントリー', 'キャリア', '新卒', '中途', '業務委託', '副業', '未経験', '職種', '正社員', 'アルバイト', 'バイト', 'join', 'career', 'recruit'],
    answer: [
      '一緒に挑戦したい仲間、大かんげいサン！',
      'ご応募・ご相談は [CONTACTページ](/contact) からどうぞサン📩',
      'きみの「やりたい」を聞かせてサン！',
    ],
  },
  {
    // サービス・できること
    topic: 'service',
    keywords: ['サービス', 'できること', '何ができ', '業務', 'ai開発', 'llm', 'デザイン', 'ブランディング', 'ロゴ', 'vi', 'ip', 'クリエイティブ', '制作', '開発', 'アプリ', 'webサイト', 'ホームページ', 'サイト制作', 'システム', 'チャットボット', '生成ai', 'chatgpt', '機械学習', 'コンサル', '運用', 'service'],
    answer: [
      'アリガトサンのサービスは、大きく3つあるサン！',
      '☀ AI / 開発 … LLMを使ったWebサービスやアプリ、AIエージェントづくり',
      '☀ デザイン / ブランディング … ロゴやVI、Webサイトの設計',
      '☀ IP / クリエイティブ … 世界観から育てる、愛されるキャラクターづくり（ぼくもそのひとりサン！）',
      'くわしくは [SERVICEページ](/service) をのぞいてみてサン！',
    ],
  },
  {
    // メンバー
    topic: 'member',
    keywords: ['メンバー', '社員', 'スタッフ', 'チーム', '誰', 'だれ', '代表', '社長', 'ceo', 'cto', '人数', '何人', 'プロフィール', 'エンジニア', 'デザイナー', '経歴', 'どんな人', 'member', 'people'],
    answer: [
      'アリガトサンには、個性ゆたかな仲間がそろっているサン！',
      'CEO・CTO・デザイナー・エンジニアなど、それぞれの専門で力を合わせているサン。',
      '[ABOUTページ](/about) の MEMBER で、ひとりひとりのプロフィールが読めるサン👀',
    ],
  },
  {
    // 実績・事例
    topic: 'works',
    keywords: ['実績', '事例', '作品', 'works', '制作物', 'ポートフォリオ', 'portfolio', 'プロジェクト', '案件', '制作事例', '導入事例', 'ケース', 'つくったもの', '作ったもの', '過去の'],
    answer: [
      'アリガトサンの実績は、[WORKSページ](/works) で見られるサン！',
      'ブランディングからAI開発まで、いろんなプロジェクトを手がけているサン。',
      '気になる事例があったら、教えてサン！',
    ],
  },
  {
    // 問い合わせ・相談・料金（詳しい料金/見積はここへ誘導）
    topic: 'contact',
    keywords: ['問い合わせ', '問合', '連絡', '相談', '依頼', '見積', 'コンタクト', 'メール', '料金', '費用', '価格', 'いくら', '値段', '予算', '発注', '商談', '打ち合わせ', '打合せ', 'ミーティング', 'contact'],
    answer: [
      'お仕事のご相談・お見積り・くわしい料金は [CONTACTページ](/contact) からどうぞサン📩',
      'お仕事のご依頼でも、ちょっとした質問でも、大かんげいサン！',
    ],
  },
  {
    // アリガトくん自身
    topic: 'character',
    keywords: ['きみ', 'あなた', 'アリガトくん', '名前', '何者', 'なにもの', '自己紹介', 'マスコット', 'キャラ', '由来', '誕生', '太陽', '性格', '誕生日', '何歳', '年齢', '趣味'],
    answer: [
      '僕はアリガトくん！アリガトサンのマスコットキャラクターサン🌞',
      '“ありがとう”の気持ちから生まれた、小さな太陽なんだサン。',
      'アリガトサンのこと、なんでも聞いてサン！',
    ],
  },
  {
    // 会社・事業（汎用。最後に置く）
    topic: 'company',
    keywords: ['会社', '事業', 'アリガトサン', 'どんな', '概要', '理念', 'ミッション', '何の', 'なんの', '所在地', '住所', 'オフィス', '設立', '沿革', 'ビジョン', '強み', '特徴', 'company', 'about'],
    answer: [
      '聞いてくれてうれしいサン！',
      'アリガトサンは、AI（LLM）の開発から、デザイン・ブランディング、IPづくりまでを手がけるクリエイティブスタジオサン。「感謝とともに昇る（RISE WITH THANKS）」を合言葉に、技術と心の両方を大事にしてるサン。やっていることは、大きく3つあるサン：',
      '☀ AI / 開発 … LLMを使ったWebやアプリ、AIエージェントづくり',
      '☀ デザイン / ブランディング … ロゴやVI、Webサイトの設計',
      '☀ IP / クリエイティブ … 世界観から育てる、愛されるキャラクターづくり（ぼくもそのひとりサン！）',
      'どのあたりが気になるサン？くわしく話せるサン！',
    ],
  },
];

// どの話題にも当てはまらない時の返答。カテゴリの例と CONTACT への導線を添える。
export const FALLBACK_ANSWER: string[] = [
  'うーん、それはうまく答えられないサン🙏',
  '「会社のこと」「サービス」「実績」「メンバー」「採用」あたりなら、くわしく話せるサン！',
  '具体的なご相談は [CONTACTページ](/contact) からでもOKサン📩',
];

// 入力文のキーワードから定型回答を選ぶ（部分一致・大文字小文字無視）。
// ※ AI 連携（B）時は、この関数の中身をサーバー応答（LLM）呼び出しに差し替える。
export function matchAnswer(input: string): string[] {
  const text = input.toLowerCase();
  for (const entry of FAQ) {
    if (entry.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      return entry.answer;
    }
  }
  return FALLBACK_ANSWER;
}

// 質問ログ用の話題分類。FAQ のキーワードを流用し、どれにも当たらなければ 'unknown'。
// LLM を追加で叩かないため分類コストはゼロ。'unknown' は「Bot が想定していない質問」＝
// FAQ 強化の手がかりになる。
export type LogTopic = FaqTopic | 'unknown';

export function classifyTopic(input: string): LogTopic {
  const text = input.toLowerCase();
  for (const entry of FAQ) {
    if (entry.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      return entry.topic;
    }
  }
  return 'unknown';
}

// 質問ログ保存前の個人情報マスキング。
// 構造的な PII（メール / 電話・長い数字列 / URL）を伏字化する。
// 文章中の氏名までは完全には検出できないため、これは「リスク低減」であり「完全な匿名化」ではない。
// 併せて IP 非保存・短期保持・管理画面のみ閲覧で多層的にリスクを下げる前提。
export function maskPII(input: string): string {
  return input
    // メールアドレス
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[メール]')
    // URL
    .replace(/https?:\/\/[^\s]+/gi, '[URL]')
    // 電話番号・長い数字列（区切り含む 9 桁以上）
    .replace(/\d[\d\s().-]{7,}\d/g, '[番号]');
}
