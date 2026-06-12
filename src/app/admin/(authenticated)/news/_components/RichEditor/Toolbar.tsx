'use client';

import type { Editor } from '@tiptap/react';
import { useState, useTransition } from 'react';
import { uploadNewsImage } from '../../../../_actions/upload';
import { generateNewsImage } from '../../../../_actions/ai-image';
import styles from './Toolbar.module.scss';

interface ToolbarProps {
  editor: Editor | null;
}

/**
 * 画像 URL から実寸（naturalWidth / naturalHeight）を読み取る。
 * 公開側がこの縦横比で「全幅(長方形) / 半幅グリッド(正方形)」を自動振り分けする。
 * 失敗時は null（寸法なし＝公開側は全幅にフォールバック）。
 */
function getImageDimensions(src: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** 画像ノードをエディタに挿入する（実寸 width/height 付き）。 */
function insertImage(
  editor: Editor,
  attrs: { src: string; alt: string; width?: number; height?: number }
) {
  editor.chain().focus().insertContent({ type: 'image', attrs }).run();
}

export default function Toolbar({ editor }: ToolbarProps) {
  const [isUploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!editor) return null;

  const handleImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/gif';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploadError(null);
      startUpload(async () => {
        const formData = new FormData();
        formData.append('file', file);
        const result = await uploadNewsImage(formData);
        if (result.ok) {
          const dims = await getImageDimensions(result.url);
          insertImage(editor, {
            src: result.url,
            alt: file.name,
            ...(dims ?? {}),
          });
        } else {
          setUploadError(result.error);
        }
      });
    };
    input.click();
  };

  const handleAiImage = () => {
    const prompt = window.prompt('生成したい画像の内容を入力してください（英語推奨）');
    if (!prompt || !prompt.trim()) return;
    setUploadError(null);
    startUpload(async () => {
      const result = await generateNewsImage(prompt.trim(), '4:3');
      if (result.ok) {
        const dims = await getImageDimensions(result.url);
        insertImage(editor, {
          src: result.url,
          alt: prompt.trim(),
          ...(dims ?? {}),
        });
      } else {
        setUploadError(result.error);
      }
    });
  };

  const handleLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('リンク URL を入力（空にすると解除）', previous ?? '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  type Btn = {
    label: string;
    title: string;
    isActive?: () => boolean;
    onClick: () => void;
    disabled?: boolean;
  };

  const buttons: Array<Btn | 'separator'> = [
    {
      label: '段落',
      title: '段落',
      isActive: () => editor.isActive('paragraph'),
      onClick: () => editor.chain().focus().setParagraph().run(),
    },
    {
      label: 'H2',
      title: '見出し H2',
      isActive: () => editor.isActive('heading', { level: 2 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: 'H3',
      title: '見出し H3',
      isActive: () => editor.isActive('heading', { level: 3 }),
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    'separator',
    {
      label: 'B',
      title: '太字',
      isActive: () => editor.isActive('bold'),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: 'I',
      title: 'イタリック',
      isActive: () => editor.isActive('italic'),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: 'コード',
      title: 'インラインコード',
      isActive: () => editor.isActive('code'),
      onClick: () => editor.chain().focus().toggleCode().run(),
    },
    'separator',
    {
      label: '・リスト',
      title: '箇条書きリスト',
      isActive: () => editor.isActive('bulletList'),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: '1. リスト',
      title: '番号付きリスト',
      isActive: () => editor.isActive('orderedList'),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: '引用',
      title: '引用',
      isActive: () => editor.isActive('blockquote'),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: 'コードブロック',
      title: 'コードブロック',
      isActive: () => editor.isActive('codeBlock'),
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    'separator',
    {
      label: 'リンク',
      title: 'リンクを挿入 / 編集',
      isActive: () => editor.isActive('link'),
      onClick: handleLink,
    },
    {
      label: isUploading ? '画像 (処理中…)' : '画像',
      title: '画像をアップロードして挿入',
      onClick: handleImage,
      disabled: isUploading,
    },
    {
      label: isUploading ? '✦AI画像 (生成中…)' : '✦AI画像',
      title: 'AIで画像を生成して挿入',
      onClick: handleAiImage,
      disabled: isUploading,
    },
    {
      label: '表',
      title: '3×3 のテーブルを挿入',
      onClick: handleTable,
    },
    'separator',
    {
      label: '↶',
      title: '元に戻す',
      onClick: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
    },
    {
      label: '↷',
      title: 'やり直し',
      onClick: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
    },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.buttons}>
        {buttons.map((btn, i) => {
          if (btn === 'separator') {
            return <span key={i} className={styles.separator} aria-hidden="true" />;
          }
          return (
            <button
              key={i}
              type="button"
              className={`${styles.btn} ${btn.isActive?.() ? styles.btnActive : ''}`}
              title={btn.title}
              onClick={btn.onClick}
              disabled={btn.disabled}
            >
              {btn.label}
            </button>
          );
        })}
      </div>
      {uploadError && (
        <p className={styles.error} role="alert">
          {uploadError}
        </p>
      )}
    </div>
  );
}
