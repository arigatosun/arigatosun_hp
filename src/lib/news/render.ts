import { generateHTML } from '@tiptap/html/server';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import type { Json } from '@/types/supabase';

// 編集側 (RichEditor) と同じ extensions セットを渡す必要がある。
// 差異があるとノードがレンダリングされない。
const EXTENSIONS = [
  StarterKit,
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
    return generateHTML(doc as Parameters<typeof generateHTML>[0], EXTENSIONS);
  } catch {
    return '';
  }
}
