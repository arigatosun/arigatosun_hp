// 個別インタビュー記事の本文データ。Figma node 4408:31664 準拠。
// 現状は ykt-innovation（ケアGO）のみ。本文・太字・改行は Figma を厳密反映。

/** テキスト断片（b=太字）。 */
export type IvSeg = { t: string; b?: boolean };
/** 段落（断片の配列）。 */
export type IvPara = IvSeg[];

export type IvBlock =
  | { type: 'divider' }
  // ■... セクション見出し（24px）。lines = 明示改行。fill=横幅いっぱいに両端揃え。mt=上余白の個別指定(px@1920)。
  | { type: 'heading'; lines: string[]; fill?: boolean; mt?: number }
  // プロジェクト概要の3項目（番号付き見出し + 2行説明）。
  | { type: 'overview'; points: { title: string; desc: string[] }[] }
  // ■GUEST SPEAKER / ■INTERVIEWER（ラベル20px + 本文行）。
  | { type: 'profile'; label: string; lines: IvPara[] }
  // ー... 質問（20px medium）。
  | { type: 'question'; text: string }
  // 回答（岡田様）/ 髙橋）+ 段落）。
  | { type: 'answer'; speaker: string; paragraphs: IvPara[] }
  // →... 補足ノート（14px）。
  | { type: 'note'; text: string }
  // 写真 / 図版。mt=上余白の個別指定(px@1920)。
  | { type: 'image'; src: string; alt: string; w: number; h: number; pos?: 'bottom'; mt?: number }
  // ケアGO実績へのリンク文。
  | { type: 'workLink' };

export type InterviewDetail = {
  slug: string;
  hero: { src: string; alt: string };
  meta: { client: string; heading: string; body: string };
  blocks: IvBlock[];
};

const IV = '/images/interview/ykt-innovation';

const YKT_INNOVATION: InterviewDetail = {
  slug: 'ykt-innovation',
  hero: { src: `${IV}/hero.jpg`, alt: '株式会社YKT Innovation インタビュー' },
  meta: {
    client: '株式会社YKT Innovation 様',
    heading: '完成形が見えないからこそ、早く形にして試す',
    body: '課題から生まれたアイデアが、現場で動く事業になるまで。弊社代表とリードエンジニアが岡田様を訪ねてお聞きした、開発の舞台裏。',
  },
  blocks: [
    { type: 'divider' },

    { type: 'heading', lines: ['■プロジェクト概要'] },
    {
      type: 'overview',
      points: [
        {
          title: '1. 自社課題を、同業他社にも広がるAI SaaS',
          desc: [
            'ケアGOは、訪問介護の現場で重かった書類作成・紙管理の課題から生まれた業界特化AI SaaSです。',
            '自社の業務改善にとどまらず、同業他社にも展開できる新規事業として構想されました。',
          ],
        },
        {
          title: '2. 他社SIer見積の約半額で、早く触れる形を実現',
          desc: [
            '開発会社選定時に評価されたのは、現実的な費用感、レスポンスの早さ、小回りの利く進め方でした。',
            '完成形が曖昧な段階でも、まず触れる形を作り、現場の反応をもとに改善できることが大きな価値になりました。',
          ],
        },
        {
          title: '3. AIモデルを用途別に使い分け、現場で使える品質へ',
          desc: [
            '画像・PDF読み取り、音声文字起こし、文章生成・整形など、処理ごとにGemini / Whisper / GPTなどのAIモデルを使い分け。',
            'AIに任せ切るのではなく、人間が確認して業務に使える出力へ整える設計にしています。',
          ],
        },
      ],
    },

    { type: 'divider' },

    {
      type: 'profile',
      label: '■GUEST SPEAKER',
      lines: [
        [{ t: '株式会社YKT Innovation 代表　岡田様' }],
        [{ t: 'COMPANY PROFILE', b: true }],
        [
          {
            t: '株式会社YKT Innovationは、介護領域を中心に事業を展開する企業です。訪問介護の現場で発生する書類作成・管理の課題を起点に、介護事業者向けAIクラウド書類管理サービス「ケアGO」を構想。弊社は、ケアGOの受託開発パートナーとして、クラウド書類管理、AIによる書類作成支援、録音データからの議事録化、電子サインなどの開発を支援しました。',
          },
        ],
      ],
    },
    {
      type: 'profile',
      label: '■INTERVIEWER',
      lines: [[{ t: '株式会社アリガトサン　代表取締役：中村修人 / リードエンジニア：高橋克哉' }]],
    },

    { type: 'divider' },

    // ── Q&A 1 ──
    { type: 'heading', lines: ['■「本来はケアに出てほしい人が、書類に時間を取られている」ー ケアGO構想の背景'], fill: true, mt: 120 },
    { type: 'question', text: 'ー ケアGOを作る前、介護現場ではどの業務が一番大きな負担になっていましたか。' },
    {
      type: 'answer',
      speaker: '岡田様',
      paragraphs: [
        [
          { t: '一番大きかったのは、書類作成でした。アセスメント、計画書、モニタリングなど、訪問介護には専門的な書類が多くあります。しかも、それは単なる事務作業として切り出せるものではありません。現場のエースであるサービス提供責任者がやらないといけない。' },
          { t: '本来はケアに出てほしい人が、書類に時間を取られている', b: true },
          { t: 'というジレンマがありました。' },
        ],
      ],
    },
    {
      type: 'answer',
      speaker: '岡田様',
      paragraphs: [
        [{ t: 'もう一つは、紙で管理していることの限界です。全国展開や複数事業所での運用を考えると、紙や書庫での管理は見えない部分が多すぎる。クラウド上で管理できて、AIで書類作成を支援できる仕組みは必須だと考えていました。' }],
      ],
    },
    { type: 'question', text: 'ー 既存のSaaSでは解決できなかった理由は何だったのでしょうか。' },
    {
      type: 'answer',
      speaker: '岡田様',
      paragraphs: [
        [
          { t: '介護系の書類は、事業種別や様式が細かく分かれています。少し出力が違うだけでも、現場では使えません。様式が違えば認められないので、汎用的なSaaSでは現実的ではありませんでした。' },
          { t: '作った人が現場を知らないと、全く使い物にならないSaaSが多い', b: true },
          { t: 'という感覚がありました。' },
        ],
      ],
    },
    { type: 'image', src: `${IV}/photo-1.jpg`, alt: 'インタビューの様子', w: 1200, h: 675 },

    // ── Q&A 2 ──
    { type: 'heading', lines: ['■「自社にも必要だし、売れる」ー 業界特化AI SaaSとしての可能性'] },
    { type: 'question', text: 'ー 最初から外販も視野に入っていたのでしょうか。' },
    {
      type: 'answer',
      speaker: '岡田様',
      paragraphs: [
        [{ t: '自社の課題解決としても必要でしたが、同時に「これは売れるな」という感覚もありました。自分たちがあったら嬉しいし、訪問介護を伸ばすうえでも必要なシステムです。さらに、ケアGOをきっかけに同業の方と話す機会も増えました。業務改善だけではなく、認知や採用にもつながる。そこが相性の良さだと思っています。' }],
        [{ t: 'ケアGOは、単なる社内効率化ツールではありません。自社の現場課題を解決しながら、同業他社との接点を作り、採用や認知にもつながる事業資産として育っていきました。' }],
      ],
    },
    { type: 'image', src: `${IV}/photo-2.jpg`, alt: 'インタビューの様子', w: 1200, h: 675 },

    // ── Q&A 3 ──
    { type: 'heading', lines: ['■「高い、遅そう」ではなく、現実的な費用感と小回りで選んだ'] },
    { type: 'question', text: 'ー 開発会社を探していた当時、アリガトサンを選んだ理由を教えてください。' },
    {
      type: 'answer',
      speaker: '岡田様',
      paragraphs: [
        [{ t: '正直なところ、他の開発会社は費用がかなり高く、スピード感も合わなさそうだと感じていました。技術の細かい部分は、この段階では私たちには分かりません。それでも「高いし、進みも遅そうだ」という印象はありました。' }],
        [{ t: 'その点アリガトサンさんは、費用感が現実的で、レスポンスが早く、小回りが利く。完成形がまだ固まっていない段階でも、まず触れる形を作ってくれて、現場の反応を見ながら改善していける。結果として、こちらの期待を超えるものが返ってきました。' }],
        [{ t: 'ただ、選んだ理由は「安さ」だけではありません。早く形にして、現場のフィードバックをきちんと取り込んでくれたこと。そこが、いちばん大きな評価ポイントだったと思います。' }],
      ],
    },

    // ── Q&A 4 ──
    { type: 'heading', lines: ['■「形が出来上がってからでないとフィードバックできない」', '　 ー 早く試して改善する開発'] },
    { type: 'question', text: 'ー 開発の進め方として、特に良かった点はどこでしたか。' },
    {
      type: 'answer',
      speaker: '岡田様',
      paragraphs: [
        [{ t: 'AIやシステムは、最初から完成形が見えているわけではありません。こちらも全部を分かっているわけではないので、形が出来上がってからでないとフィードバックできない。だから、早めに納品して一旦試し、そこから改善していく進め方が良かったです。' }],
      ],
    },
    {
      type: 'answer',
      speaker: '岡田様',
      paragraphs: [
        [{ t: '最初の構想からも、かなり形は変わりました。当初はRPAのように転記する案もありましたが、最終的にはクラウド上に書類を持ち、その中で保管・管理していく形になりました。電子サインなど、当初より増えた機能もあります。現場の意見をもらいながら、最善の形に近づいていった感覚があります。' }],
      ],
    },
    { type: 'question', text: 'ー 要望に対するアリガトサンの向き合い方は、どのように感じていましたか。' },
    {
      type: 'answer',
      speaker: '岡田様',
      paragraphs: [
        [{ t: '要望をそのまま作るというより、システムを見ながら「こっちの方が使いやすいのでは」と噛み砕いて返してくれるところが強いです。こちらが思っていたものより良い形で返ってくることが多かった。100点以上を超えて返ってくる、思っていたより良いという感覚がありました。' }],
      ],
    },
    { type: 'image', src: `${IV}/works-17.png`, alt: 'ケアGO 開発プロセス図', w: 1200, h: 765, mt: 60 },
    {
      type: 'note',
      text: '→完成形が曖昧な新規SaaS開発では、発注者がすべてを仕様書に落とし込めるわけではありません。現場の課題を汲み取り、実装可能な形に翻訳する力が、ケアGOの開発では大きな価値になりました。',
    },

    // ── Q&A 5 ──
    { type: 'heading', lines: ['■「10時間くらいかかっていたものが、1時間くらいになる」', '　 ー 社内検証と導入後の反応'] },
    { type: 'question', text: 'ー 社内で使ってみたとき、どのような反応がありましたか。' },
    {
      type: 'answer',
      speaker: '岡田様',
      paragraphs: [
        [
          { t: '社内では、みんな喜んでいます。書類作成時間が大きく短くなる感覚があり、' },
          { t: '10時間くらいかかっていたものが、1時間くらいになるイメージ', b: true },
          { t: 'です。' },
        ],
        [{ t: 'サービス提供責任者の時間が空けば、その分ケアや事業運営に向き合えます。だから、他社にも売っていけるという確信が強くなりました。' }],
      ],
    },
    { type: 'question', text: 'ー 導入後の利用者からは、どのような声が届いていますか。' },
    {
      type: 'answer',
      speaker: '岡田様',
      paragraphs: [
        [{ t: '今あるシステムへの不満というより、「これもできないですか」「この対応はできないですか」という声が多いです。つまり、もっと広げたいという反応です。プロダクトが現場の課題に刺さっているからこそ、追加でやりたいことが出てきているのだと思います。' }],
      ],
    },

    // ── Q&A 6 ──
    { type: 'heading', lines: ['■「この機能にはこれが強い」ー AIモデルを用途別に使い分ける実装'] },
    { type: 'question', text: 'ー ケアGOの中で、AIはどのように使われていますか。' },
    {
      type: 'answer',
      speaker: '岡田様',
      paragraphs: [
        [{ t: '電子サイン以外は、かなりAIを使っています。書類作成、議事録、手順書など、AIが関わる機能は多いです。議事録は最初の精度に課題がありましたが、モデルを変えたり、プロンプトを調整したりして、かなり良くなりました。' }],
      ],
    },
    {
      type: 'answer',
      speaker: '髙橋',
      paragraphs: [
        [{ t: '処理ごとに、適したAIモデルを見ています。画像やPDFの読み取りはGeminiが強い。一方で、音声文字起こしにはWhisper、文章生成や整形にはGPTを使う場面があります。すべてを一つのAIモデルで処理するのではなく、用途ごとに選ぶ設計です。ケアGOのAI実装は、入力、AI処理、人間確認、出力の流れと、用途別モデル選定を合わせて見ると理解しやすくなります。' }],
      ],
    },
    { type: 'image', src: `${IV}/works-15.png`, alt: 'AIモデル用途別の使い分け図', w: 1200, h: 610, mt: 60 },
    { type: 'image', src: `${IV}/works-18.png`, alt: 'ケアGO AI処理フロー図', w: 1200, h: 615 },

    // ── Q&A 7 ──
    { type: 'heading', lines: ['■「AIの会社って怖い」からこそ、不安を下げる進め方が必要'], mt: 120 },
    { type: 'question', text: 'ー AIやシステム開発を検討している企業に、アリガトサンをどう紹介しますか。' },
    {
      type: 'answer',
      speaker: '岡田様',
      paragraphs: [
        [{ t: 'AIの会社は、相場が分かりにくくて怖いと思うんです。だからこそ、安心して相談できることが大事で、その点でアリガトサンさんは安心してお願いできる会社だと思います。ケアGOの開発でも、レスポンスが早くて、こちらのふわっとした要望にも「それなら、こういう機能で実装できますよ」と返してくれました。費用感を現実的に示してくれて、早く触れる形を出してくれて、曖昧な要望にも仮説を返してくれて、小回りよく改善してくれる。初めて相談する企業でも不安を下げられる、こういう進め方ができる会社なので、AIやシステム開発を考えているなら勧めたいですね。' }],
      ],
    },
    { type: 'image', src: `${IV}/photo-bottom.jpg`, alt: 'インタビューの様子', w: 1200, h: 733, pos: 'bottom', mt: 80 },

    // ── ケアGO実績紹介 ──
    { type: 'heading', lines: ['■ケアGOの実績紹介'], mt: 120 },
    { type: 'image', src: `${IV}/banner.jpg`, alt: 'ケアGO 介護業界特化AI SaaSの開発', w: 1200, h: 513 },
    { type: 'workLink' },
  ],
};

const DETAILS: Record<string, InterviewDetail> = {
  'ykt-innovation': YKT_INNOVATION,
};

/** slug から記事本文を取得（無ければ undefined）。 */
export function getInterviewDetailBySlug(slug: string): InterviewDetail | undefined {
  return DETAILS[slug];
}
