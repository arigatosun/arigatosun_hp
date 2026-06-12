import Image from '@tiptap/extension-image';

/**
 * ニュース本文の画像ノード拡張。
 * 標準の Image に width / height 属性を追加し、挿入時に取得した画像の
 * 実寸（naturalWidth / naturalHeight）を保持する。
 *
 * 公開側レンダリング（src/lib/news/render.ts）はこの width / height から
 * 縦横比を判定し、横長 → 全幅 / 正方形 → 半幅グリッド に自動振り分けする。
 * 編集側（RichEditor）と公開側で同じ拡張を使うことで、属性の保存・復元の
 * 整合を取る。
 */
export const NewsImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute('width'),
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}),
      },
      height: {
        default: null,
        parseHTML: (el) => el.getAttribute('height'),
        renderHTML: (attrs) => (attrs.height ? { height: attrs.height } : {}),
      },
    };
  },
});
