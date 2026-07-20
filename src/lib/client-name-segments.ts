/**
 * クライアント名を「日本語の連なり」と「それ以外（英数字）の連なり」に分割する。
 *
 * Figma ではクライアント名の日本語部分と英字部分で書体・サイズ・ウェイト・字間が
 * それぞれ別に指定されている（例: 英字 Mozaic GEO 20px/300、日本語 Noto Sans JP 18px/400）。
 * 文字列全体を「日本語を含むか」で判定して一括で出し分けると、
 * 「株式会社YKT Innovation」のような日英混在名で英字部分まで日本語の指定になり、
 * 英字だけ太く見えてしまう。文字種の変わり目で区切って個別に当てるためのユーティリティ。
 */

// ひらがな / カタカナ / 漢字 / 半角カナ / 々〆 / 全角記号（：等）
const JA_CHAR = /[぀-ヿ㐀-鿿ｦ-ﾟ々〆〇！-｠]/;

export type NameSegment = {
  text: string;
  /** true = 日本語の連なり / false = 英数字の連なり */
  isJa: boolean;
};

export function splitClientName(name: string): NameSegment[] {
  const segments: NameSegment[] = [];

  for (const char of name) {
    const isJa = JA_CHAR.test(char);
    const last = segments[segments.length - 1];

    // 半角スペースは前の連なりに含める（「株式会社YKT Innovation」の語間で
    // 区切りが増えて字間が二重に効くのを避ける）。
    if (last && (last.isJa === isJa || char === ' ')) {
      last.text += char;
    } else {
      segments.push({ text: char, isJa });
    }
  }

  return segments;
}
