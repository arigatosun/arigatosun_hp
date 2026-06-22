import { generateHTML } from '@tiptap/html/server';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { NewsImage } from './image-extension';
import type { Json } from '@/types/supabase';

// 編集側 (RichEditor) と同じ extensions セットを渡す必要がある。
// 差異があるとノードがレンダリングされない。画像は NewsImage（width/height 保持）。
const EXTENSIONS = [
  // StarterKit v3 は Link を内包するため、明示的に追加する Link と重複しないよう無効化。
  StarterKit.configure({ link: false }),
  Link.configure({ openOnClick: false, autolink: true }),
  NewsImage,
  Table.configure({ resizable: false }),
  TableRow,
  TableCell,
  TableHeader,
];

type DocNode = Parameters<typeof generateHTML>[0];
type TipTapNode = { type?: string; attrs?: Record<string, unknown>; content?: unknown };

// 横長(幅÷高さ ≥ 1.2)は全幅、それ未満（正方形〜縦長）は半幅グリッドへ。
const WIDE_RATIO_THRESHOLD = 1.2;

function classifyImage(node: TipTapNode): 'wide' | 'square' {
  const w = Number(node.attrs?.width);
  const h = Number(node.attrs?.height);
  if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
    return w / h >= WIDE_RATIO_THRESHOLD ? 'wide' : 'square';
  }
  // 寸法不明（旧記事の画像など）は全幅にフォールバックして従来の見た目を保つ。
  return 'wide';
}

function escapeAttr(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function imgTag(node: TipTapNode): string {
  const src = escapeAttr(node.attrs?.src);
  const alt = escapeAttr(node.attrs?.alt);
  const w = node.attrs?.width;
  const h = node.attrs?.height;
  const dims = w && h ? ` width="${escapeAttr(w)}" height="${escapeAttr(h)}"` : '';
  return `<img src="${src}" alt="${alt}"${dims} loading="lazy" decoding="async" />`;
}

function wideFigure(node: TipTapNode): string {
  return `<figure data-news-img="wide">${imgTag(node)}</figure>`;
}

function squareGrid(nodes: TipTapNode[]): string {
  const items = nodes
    .map((n) => `<figure data-news-img="square">${imgTag(n)}</figure>`)
    .join('');
  return `<div data-news-grid>${items}</div>`;
}

/**
 * 管理画面で保存された TipTap JSON を、公開ページ表示用の HTML 文字列に変換する。
 * - 画像ノードは縦横比で「全幅(長方形)」と「半幅グリッド(正方形)」に自動振り分け。
 *   連続した正方形は 1 つの 2 列グリッドにまとめる（1 枚なら左半分）。
 * - 画像以外のノード（見出し/段落/リスト/表/引用 等）は従来どおり generateHTML で生成。
 * - 不正な構造（空 object など）の場合は空文字を返す。
 * - 結果は dangerouslySetInnerHTML で描画する想定（admin が編集した信頼コンテンツ）。
 */
export function renderNewsContentToHtml(content: Json): string {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return '';
  }
  const doc = content as { type?: string; content?: TipTapNode[] };
  if (doc.type !== 'doc') return '';

  // content 配列が無い（空ドキュメント等）は従来どおり generateHTML に委ねる。
  if (!Array.isArray(doc.content)) {
    try {
      return preserveEmptyParagraphs(addImageLoadingHints(generateHTML(doc as DocNode, EXTENSIONS)));
    } catch {
      return '';
    }
  }

  const out: string[] = [];
  let textBuf: TipTapNode[] = [];
  let squareBuf: TipTapNode[] = [];

  const flushText = () => {
    if (textBuf.length === 0) return;
    try {
      const html = generateHTML({ type: 'doc', content: textBuf } as DocNode, EXTENSIONS);
      out.push(preserveEmptyParagraphs(addImageLoadingHints(html)));
    } catch {
      // 一部ノードのレンダリング失敗時は黙ってスキップ（全体は壊さない）。
    }
    textBuf = [];
  };
  const flushSquares = () => {
    if (squareBuf.length === 0) return;
    out.push(squareGrid(squareBuf));
    squareBuf = [];
  };

  for (const node of doc.content) {
    if (node?.type === 'image') {
      flushText();
      if (classifyImage(node) === 'square') {
        squareBuf.push(node);
      } else {
        flushSquares();
        out.push(wideFigure(node));
      }
    } else {
      flushSquares();
      textBuf.push(node);
    }
  }
  flushSquares();
  flushText();

  return out.join('');
}

/**
 * 画像 <img> に loading="lazy" / decoding="async" を付与し、ファーストビュー外の
 * 記事画像を遅延ロードする。既に loading 指定がある img はスキップ（見た目は不変）。
 */
function addImageLoadingHints(html: string): string {
  return html.replace(/<img(?![^>]*\sloading=)/gi, '<img loading="lazy" decoding="async"');
}

/**
 * 管理画面で Enter のみで作った空行は TipTap 上は空段落 {type:'paragraph'} となり、
 * generateHTML が `<p></p>` を出力する。これは高さ 0 ＋ マージン相殺で公開ページ上は
 * 消えてしまう（＝改行が反映されない）。`<br>` を入れて 1 行ぶんの空行として残す。
 */
function preserveEmptyParagraphs(html: string): string {
  return html.replace(/<p><\/p>/g, '<p><br></p>');
}
