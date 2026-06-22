import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { NewsImage } from './image-extension';
import type { Json } from '@/types/supabase';

const EXTENSIONS = [
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

const WIDE_RATIO_THRESHOLD = 1.2;

function classifyImage(node: TipTapNode): 'wide' | 'square' {
  const w = Number(node.attrs?.width);
  const h = Number(node.attrs?.height);
  if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
    return w / h >= WIDE_RATIO_THRESHOLD ? 'wide' : 'square';
  }
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

export function renderNewsContentToHtmlClient(content: Json): string {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return '';
  }
  const doc = content as { type?: string; content?: TipTapNode[] };
  if (doc.type !== 'doc') return '';

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
      // Skip invalid blocks so the preview keeps rendering.
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

function addImageLoadingHints(html: string): string {
  return html.replace(/<img(?![^>]*\sloading=)/gi, '<img loading="lazy" decoding="async"');
}

/**
 * 管理画面で Enter のみで作った空行は TipTap 上は空段落 {type:'paragraph'} となり、
 * generateHTML が `<p></p>` を出力する。これは高さ 0 ＋ マージン相殺で消えてしまう
 * （＝改行が反映されない）。`<br>` を入れて 1 行ぶんの空行として残す。
 */
function preserveEmptyParagraphs(html: string): string {
  return html.replace(/<p><\/p>/g, '<p><br></p>');
}
