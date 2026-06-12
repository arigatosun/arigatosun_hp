'use client';

import { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { NewsImage } from '@/lib/news/image-extension';
// TipTap v3 では Table / TableRow / TableCell / TableHeader は named export
// （default export は無いので注意）
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import Placeholder from '@tiptap/extension-placeholder';
import Toolbar from './Toolbar';
import styles from './RichEditor.module.scss';

interface RichEditorProps {
  name: string;
  defaultValue?: unknown;
}

// TipTap content として有効な初期値を返す。
// - object (TipTap JSON) → そのまま
// - string (Phase B 残骸の素テキスト) → 単一段落として扱う
// - null/undefined → 空
function buildInitialContent(value: unknown): object | string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    if (!value.trim()) return undefined;
    // JSON 文字列の可能性も
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      // 素テキストとして扱う
    }
    return value;
  }
  if (typeof value === 'object') return value as object;
  return undefined;
}

export default function RichEditor({ name, defaultValue }: RichEditorProps) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const initialContent = buildInitialContent(defaultValue);
  const initialJsonString = initialContent
    ? typeof initialContent === 'string'
      ? JSON.stringify(initialContent)
      : JSON.stringify(initialContent)
    : '';

  const editor = useEditor({
    extensions: [
      // StarterKit v3 は Link を内包するため、明示的に追加する Link と重複しないよう無効化。
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      NewsImage,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: '本文を入力...（ツールバーで見出し・太字・リスト・画像・テーブル等を挿入）' }),
    ],
    content: initialContent,
    // Next.js App Router で hydration mismatch を避けるため必須
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (hiddenRef.current) {
        hiddenRef.current.value = JSON.stringify(editor.getJSON());
      }
    },
  });

  return (
    <div className={styles.root}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className={styles.editor} />
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={initialJsonString} />
    </div>
  );
}
