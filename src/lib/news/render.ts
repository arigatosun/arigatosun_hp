import { generateHTML } from '@tiptap/html/server';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import type { Json } from '@/types/supabase';

// 編集側 (RichEditor) と同じ extensions セットを渡す必要がある。
// 差異があるとノードがレンダリングされない。
const EXTENSIONS = [
  // StarterKit v3 は Link を内包するため、明示的に追加する Link と重複しないよう無効化。
  StarterKit.configure({ link: false }),
  Link.configure({ openOnClick: false, autolink: true }),
  Image,
  Table.configure({ resizable: false }),
  TableRow,
  TableCell,
  TableHeader,
];

/**
 * 管理画面で保存された TipTap JSON を、公開ページ表示用の HTML 文字列に変換する。
 * - 不正な構造（空 object など）の場合は空文字を返す
 * - 結果は dangerouslySetInnerHTML で描画する想定（admin が編集した信頼コンテンツ）
 */
export function renderNewsContentToHtml(content: Json): string {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return '';
  }
  const doc = content as { type?: string; content?: unknown };
  if (doc.type !== 'doc') return '';

  try {
    const html = generateHTML(doc as Parameters<typeof generateHTML>[0], EXTENSIONS);
    return addImageLoadingHints(html);
  } catch {
    return '';
  }
}

/**
 * 本文中の <img>（TipTap 画像。Supabase Storage の生 URL で next/image を通らない）に
 * loading="lazy" / decoding="async" を付与し、ファーストビュー外の記事画像を遅延ロードする。
 * 既に loading 指定がある img はスキップ。見た目は不変。
 */
function addImageLoadingHints(html: string): string {
  return html.replace(/<img(?![^>]*\sloading=)/gi, '<img loading="lazy" decoding="async"');
}
