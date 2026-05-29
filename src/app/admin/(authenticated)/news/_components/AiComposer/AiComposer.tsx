'use client';

import { useState, useTransition } from 'react';
import type { Database } from '@/types/supabase';
import {
  generateNewsDraft,
  createCategory,
  type AiDraft,
} from '../../../../_actions/ai-compose';
import { blocksToTiptap } from '@/lib/news/ai-blocks';
import NewsForm, { type NewsFormInitialValues } from '../NewsForm';
import styles from './AiComposer.module.scss';

type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface AiComposerProps {
  initialCategories: CategoryRow[];
}

export default function AiComposer({ initialCategories }: AiComposerProps) {
  const [rawText, setRawText] = useState('');
  const [context, setContext] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  const [generating, startGenerate] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<AiDraft | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories);
  const [categoryId, setCategoryId] = useState('');
  const [formKey, setFormKey] = useState(0);

  const [creatingCat, startCreateCat] = useTransition();
  const [catError, setCatError] = useState<string | null>(null);
  const [catCreated, setCatCreated] = useState(false);

  const handleGenerate = () => {
    setError(null);
    startGenerate(async () => {
      const res = await generateNewsDraft({
        rawText,
        context: context.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDraft(res.draft);
      setCatCreated(false);
      setCatError(null);
      setCategoryId(res.draft.category.mode === 'existing' ? res.draft.category.id : '');
      setFormKey((k) => k + 1);
    });
  };

  const handleCreateCategory = () => {
    if (!draft || draft.category.mode !== 'new') return;
    const { slug, label } = draft.category;
    setCatError(null);
    startCreateCat(async () => {
      const res = await createCategory(slug, label);
      if (!res.ok) {
        setCatError(res.error);
        return;
      }
      setCategories((prev) => [
        ...prev,
        {
          id: res.id,
          slug: res.slug,
          label: res.label,
          display_order: (prev.reduce((m, c) => Math.max(m, c.display_order), 0) ?? 0) + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as CategoryRow,
      ]);
      setCategoryId(res.id);
      setCatCreated(true);
      setFormKey((k) => k + 1);
    });
  };

  const resetToInput = () => {
    setDraft(null);
    setError(null);
  };

  // ===== 入力ステップ =====
  if (!draft) {
    return (
      <div className={styles.root}>
        <label className={styles.field}>
          <span className={styles.label}>素材テキスト（必須）</span>
          <textarea
            className={styles.textarea}
            rows={10}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="伝えたい内容・メモ・箇条書き・元になる文章などを貼り付けてください。"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>補足コンテキスト（任意）</span>
          <textarea
            className={styles.textarea}
            rows={3}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="対象読者・トーン・希望カテゴリ・強調したい点など。"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>参考URL（任意）</span>
          <input
            type="url"
            className={styles.input}
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://..."
          />
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primary}
            onClick={handleGenerate}
            disabled={generating || !rawText.trim()}
          >
            {generating ? 'AIが生成中…' : 'AIで生成する'}
          </button>
        </div>
      </div>
    );
  }

  // ===== レビューステップ =====
  const initialValues: NewsFormInitialValues = {
    title: draft.title,
    slug: draft.slug,
    category_id: categoryId,
    description: draft.description,
    thumbnail_alt: draft.thumbnailAlt,
    thumbnailPrompt: draft.thumbnailPrompt,
    content: blocksToTiptap(draft.body),
  };

  const needsCategoryApproval = draft.category.mode === 'new' && !categoryId;

  return (
    <div className={styles.root}>
      <div className={styles.reviewBanner} role="status">
        AIが下書きを生成しました。内容を確認・編集して公開してください。
        <button type="button" className={styles.linkButton} onClick={resetToInput}>
          素材を入れ直す
        </button>
      </div>

      {needsCategoryApproval && draft.category.mode === 'new' && (
        <div className={styles.categoryPanel}>
          <p className={styles.categoryPanelText}>
            AIが新しいカテゴリ「<strong>{draft.category.label}</strong>」（slug:{' '}
            <code>{draft.category.slug}</code>）を提案しました。作成して使用しますか？
            <br />
            既存カテゴリから選びたい場合は下のフォームで選択してください。
          </p>
          {catError && (
            <p className={styles.error} role="alert">
              {catError}
            </p>
          )}
          <button
            type="button"
            className={styles.secondary}
            onClick={handleCreateCategory}
            disabled={creatingCat}
          >
            {creatingCat ? '作成中…' : `「${draft.category.label}」を作成して使用`}
          </button>
        </div>
      )}

      {catCreated && (
        <p className={styles.successNote} role="status">
          新カテゴリを作成して選択しました。
        </p>
      )}

      <details className={styles.imageHints}>
        <summary>画像の作り方（AI生成プロンプト付き）</summary>
        <p className={styles.imageHintNote}>
          サムネイルは下のフォームの「✦ AIで生成」ボタンで生成できます（AI提案プロンプトが初期入力されます）。
          実写に差し替えたい場合は「画像をアップロード」から。本文中の画像はエディタの「✦AI画像」ボタンで生成・挿入できます。
        </p>
        {draft.thumbnailPrompt && (
          <div className={styles.imageHintItem}>
            <span className={styles.imageHintLabel}>サムネイル提案</span>
            <p className={styles.imageHintPrompt}>{draft.thumbnailPrompt}</p>
            <p className={styles.imageHintAlt}>alt: {draft.thumbnailAlt || '（未設定）'}</p>
          </div>
        )}
        {draft.inlineImages.map((img, i) => (
          <div key={i} className={styles.imageHintItem}>
            <span className={styles.imageHintLabel}>本文画像 提案 {i + 1}</span>
            <p className={styles.imageHintPrompt}>{img.prompt}</p>
            <p className={styles.imageHintAlt}>alt: {img.alt}</p>
          </div>
        ))}
      </details>

      <NewsForm key={formKey} categories={categories} initialValues={initialValues} />
    </div>
  );
}
