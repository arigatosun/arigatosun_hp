import type { Json } from '@/types/supabase';

// AI（Claude）に出力させる本文の中間表現。
// 生の TipTap JSON を直接生成させると不正構造が混入しやすいため、
// 安全な簡易ブロック配列で受け取り、ここで決定論的に TipTap doc へ変換する。
export type AiBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bulletList'; items: string[] }
  | { type: 'orderedList'; items: string[] }
  | { type: 'blockquote'; text: string };

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
};

function textNode(text: string): TiptapNode {
  return { type: 'text', text };
}

function paragraph(text: string): TiptapNode {
  const t = text.trim();
  // 空段落は content を持たない（TipTap の空 paragraph 表現）
  return t ? { type: 'paragraph', content: [textNode(t)] } : { type: 'paragraph' };
}

function listItem(text: string): TiptapNode {
  return { type: 'listItem', content: [paragraph(text)] };
}

function blockToNode(block: AiBlock): TiptapNode | null {
  switch (block.type) {
    case 'heading': {
      const t = block.text.trim();
      if (!t) return null;
      const level = block.level === 3 ? 3 : 2;
      return { type: 'heading', attrs: { level }, content: [textNode(t)] };
    }
    case 'paragraph': {
      const t = block.text.trim();
      if (!t) return null;
      return paragraph(t);
    }
    case 'bulletList':
    case 'orderedList': {
      const items = (block.items ?? []).map((i) => i.trim()).filter(Boolean);
      if (items.length === 0) return null;
      return { type: block.type, content: items.map(listItem) };
    }
    case 'blockquote': {
      const t = block.text.trim();
      if (!t) return null;
      return { type: 'blockquote', content: [paragraph(t)] };
    }
    default:
      return null;
  }
}

/**
 * AiBlock 配列を TipTap doc JSON に変換する。
 * 空・不正ブロックは除外し、結果が空なら空段落1個のドキュメントを返す。
 */
export function blocksToTiptap(blocks: AiBlock[]): Json {
  const nodes = (blocks ?? [])
    .map(blockToNode)
    .filter((n): n is TiptapNode => n !== null);

  const content = nodes.length > 0 ? nodes : [{ type: 'paragraph' }];
  return { type: 'doc', content } as unknown as Json;
}
