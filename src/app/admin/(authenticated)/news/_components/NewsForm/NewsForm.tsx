'use client';

import { useActionState, useCallback, useEffect, useRef, useState } from 'react';
import { saveNews, type NewsFormState } from '../../../../_actions/news';
import type { Database, Json } from '@/types/supabase';
import RichEditor from '../RichEditor';
import ImageUploader from '../ImageUploader';
import styles from './NewsForm.module.scss';

type NewsRow = Database['public']['Tables']['news']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];

// AI 下書き等からフォームを初期化するための値（新規作成時のみ適用）。
export interface NewsFormInitialValues {
  title?: string;
  slug?: string;
  category_id?: string;
  description?: string;
  thumbnail_url?: string | null;
  thumbnail_alt?: string;
  // サムネ AI 生成の初期プロンプト候補（ImageUploader の「AIで生成」に渡す）
  thumbnailPrompt?: string;
  content?: Json;
}

interface NewsFormProps {
  news?: NewsRow;
  categories: CategoryRow[];
  initialValues?: NewsFormInitialValues;
}

const initialState: NewsFormState = { idle: true };
const NEWS_PREVIEW_STORAGE_KEY = 'arigatosun:news-preview:v1';

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewsForm({ news, categories, initialValues }: NewsFormProps) {
  const [state, formAction, isPending] = useActionState(saveNews, initialState);
  const [submitIntent, setSubmitIntent] = useState<'draft' | 'publish' | null>(null);
  const [isDirty, setIsDirty] = useState(() => !news && Boolean(initialValues));
  const formRef = useRef<HTMLFormElement>(null);
  const initialFingerprintRef = useRef<string | null>(null);
  const dirtyCheckFrameRef = useRef<number | null>(null);
  const intentRef = useRef<HTMLInputElement>(null);
  // 公開日時: 画面表示用の datetime-local (publishedAtInputRef) と、
  // サーバーに送る UTC ISO 用の hidden (publishedAtHiddenRef) を分離する。
  const publishedAtInputRef = useRef<HTMLInputElement>(null);
  const publishedAtHiddenRef = useRef<HTMLInputElement>(null);
  const isPublished = news?.status === 'published';
  const fieldErrors = 'fieldErrors' in state ? (state.fieldErrors ?? {}) : {};
  const globalError = 'error' in state ? state.error : null;
  const pendingIntent = isPending ? submitIntent : null;
  const isDraftPending = pendingIntent === 'draft';
  const isPublishPending = pendingIntent === 'publish';
  const hasSavedNews = Boolean(news);

  // 既存記事の値を最優先、無ければ AI 下書き等の初期値、それも無ければ空。
  const init = {
    title: news?.title ?? initialValues?.title ?? '',
    slug: news?.slug ?? initialValues?.slug ?? '',
    category_id: news?.category_id ?? initialValues?.category_id ?? '',
    description: news?.description ?? initialValues?.description ?? '',
    thumbnail_alt: news?.thumbnail_alt ?? initialValues?.thumbnail_alt ?? '',
    thumbnail_url: news?.thumbnail_url ?? initialValues?.thumbnail_url ?? null,
    content: news?.content ?? initialValues?.content,
  };

  // React 19 の formAction では submitter button の name/value が
  // FormData に乗らないケースがあるため、hidden input も併用して intent を渡す。
  // 送信時には submitter を見て、押されたボタンの intent を最後に確定させる。
  const setIntent = (value: 'draft' | 'publish') => {
    if (intentRef.current) intentRef.current.value = value;
    setSubmitIntent(value);
  };

  const getFormSnapshot = useCallback(() => {
    const form = formRef.current;
    if (!form) return [];
    const formData = new FormData(form);
    const ignoredFields = new Set(['id', 'intent', 'published_at']);
    const entries: Array<[string, string]> = [];

    formData.forEach((value, key) => {
      if (ignoredFields.has(key)) return;
      entries.push([key, typeof value === 'string' ? value : value.name]);
    });
    entries.push(['published_at_local', publishedAtInputRef.current?.value ?? '']);

    return entries;
  }, []);

  const hasMeaningfulValue = useCallback(() => {
    return getFormSnapshot().some(([, value]) => value.trim() !== '');
  }, [getFormSnapshot]);

  const getFingerprint = useCallback(() => {
    return JSON.stringify(getFormSnapshot());
  }, [getFormSnapshot]);

  const updateDirtyState = useCallback(() => {
    if (!hasSavedNews) {
      setIsDirty(hasMeaningfulValue());
      return;
    }

    const initialFingerprint = initialFingerprintRef.current;
    if (!initialFingerprint) return;
    setIsDirty(getFingerprint() !== initialFingerprint);
  }, [getFingerprint, hasMeaningfulValue, hasSavedNews]);

  const scheduleDirtyCheck = useCallback(() => {
    if (dirtyCheckFrameRef.current) {
      cancelAnimationFrame(dirtyCheckFrameRef.current);
    }
    dirtyCheckFrameRef.current = requestAnimationFrame(() => {
      dirtyCheckFrameRef.current = null;
      updateDirtyState();
    });
  }, [updateDirtyState]);

  // datetime-local はタイムゾーン無しのナイーブ文字列のため、サーバー（本番=UTC）で
  // new Date() するとローカル時刻として誤解釈され、JST 入力が +9h ズレて予約公開になる。
  // そこで送信前にブラウザ（ユーザーの TZ）で UTC ISO に変換し hidden 経由でサーバーへ渡す。
  // 表示側 toDatetimeLocal もブラウザ TZ なので、これで読み書きが対称になる。
  const syncPublishedAt = () => {
    const hidden = publishedAtHiddenRef.current;
    if (!hidden) return;
    const local = publishedAtInputRef.current?.value ?? '';
    if (!local) {
      hidden.value = '';
      return;
    }
    const d = new Date(local);
    // 不正値はそのまま渡し、サーバー側のフォーマット検証に委ねる
    hidden.value = Number.isNaN(d.getTime()) ? local : d.toISOString();
  };

  const secondaryLabel = isPublished ? '下書きに戻す' : '下書きとして保存';
  const secondaryPendingLabel = isPublished ? '戻しています...' : '下書き保存中...';
  const primaryLabel = isPublished ? '公開情報を更新' : '公開する';
  const primaryPendingLabel = isPublished ? '更新中...' : '公開中...';
  const canUseSecondary = isPublished || isDirty;
  const canUsePrimary = isPublished ? isDirty : hasSavedNews || isDirty;
  const canPreview = hasSavedNews || isDirty;

  const handlePreview = () => {
    const form = formRef.current;
    if (!form) return;

    syncPublishedAt();
    const formData = new FormData(form);
    const categoryId = String(formData.get('category_id') ?? '');
    const category = categories.find((c) => c.id === categoryId);
    const contentRaw = String(formData.get('content') ?? '');
    let content: Json = {};

    try {
      const parsed = JSON.parse(contentRaw);
      content = parsed && typeof parsed === 'object' ? (parsed as Json) : {};
    } catch {
      content = {};
    }

    const publishedAt =
      String(formData.get('published_at') ?? '') || news?.published_at || new Date().toISOString();
    const editUrl = news ? `/admin/news/${news.id}/edit` : '/admin/news/new';
    const payload = {
      title: String(formData.get('title') ?? ''),
      slug: String(formData.get('slug') ?? ''),
      categoryLabel: category?.label ?? '',
      description: String(formData.get('description') ?? ''),
      thumbnailUrl: String(formData.get('thumbnail_url') ?? ''),
      thumbnailAlt: String(formData.get('thumbnail_alt') ?? ''),
      publishedAt,
      content,
      editUrl,
      capturedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(NEWS_PREVIEW_STORAGE_KEY, JSON.stringify(payload));
      window.open('/admin/news/preview', '_blank', 'noopener,noreferrer');
    } catch {
      window.alert('プレビューを開けませんでした。ブラウザの設定をご確認ください。');
    }
  };

  useEffect(() => {
    initialFingerprintRef.current = getFingerprint();

    return () => {
      if (dirtyCheckFrameRef.current) {
        cancelAnimationFrame(dirtyCheckFrameRef.current);
      }
    };
  }, [getFingerprint]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={styles.root}
      aria-busy={isPending}
      onChange={scheduleDirtyCheck}
      onInput={scheduleDirtyCheck}
      onSubmit={(event) => {
        const submitter = (event.nativeEvent as SubmitEvent).submitter;
        const submitterValue =
          submitter instanceof HTMLButtonElement && submitter.value === 'publish'
            ? 'publish'
            : submitter instanceof HTMLButtonElement && submitter.value === 'draft'
              ? 'draft'
              : null;
        const currentIntent =
          submitterValue ?? (intentRef.current?.value === 'publish' ? 'publish' : 'draft');
        setIntent(currentIntent);
        syncPublishedAt();
      }}
    >
      {news && <input type="hidden" name="id" value={news.id} />}
      <input ref={intentRef} type="hidden" name="intent" defaultValue="draft" />
      <input ref={publishedAtHiddenRef} type="hidden" name="published_at" />

      {globalError && (
        <p className={styles.errorBanner} role="alert">
          {globalError}
        </p>
      )}

      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          タイトル <span className={styles.required}>必須</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={init.title}
          className={styles.input}
          maxLength={200}
        />
        {fieldErrors.title && <p className={styles.fieldError}>{fieldErrors.title}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="slug" className={styles.label}>
          スラッグ <span className={styles.required}>必須</span>
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          defaultValue={init.slug}
          className={styles.input}
          maxLength={100}
          pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
        />
        <p className={styles.hint}>
          半角英小文字・数字・ハイフンのみ。同じ年内でユニーク。公開 URL は /news/[公開年]/[スラッグ]。
        </p>
        {fieldErrors.slug && <p className={styles.fieldError}>{fieldErrors.slug}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="category_id" className={styles.label}>
          カテゴリー <span className={styles.required}>必須</span>
        </label>
        <select
          id="category_id"
          name="category_id"
          required
          defaultValue={init.category_id}
          className={styles.select}
        >
          <option value="">選択してください</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        {fieldErrors.category_id && <p className={styles.fieldError}>{fieldErrors.category_id}</p>}
      </div>

      <div className={styles.field}>
        <span className={styles.label}>サムネイル画像</span>
        <ImageUploader
          name="thumbnail_url"
          defaultValue={init.thumbnail_url}
          label="サムネイル"
          aiPrompt={initialValues?.thumbnailPrompt}
          aiAspectRatio="16:9"
          onValueChange={scheduleDirtyCheck}
        />
        <p className={styles.hint}>news-images バケットにアップロードされ、公開 URL が保存されます</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="thumbnail_alt" className={styles.label}>
          サムネイル代替テキスト（alt）
        </label>
        <input
          id="thumbnail_alt"
          name="thumbnail_alt"
          type="text"
          defaultValue={init.thumbnail_alt}
          className={styles.input}
          maxLength={150}
        />
        <p className={styles.hint}>
          画像の内容を説明するテキスト。画像SEO・アクセシビリティ向上に使われます（空欄ならタイトルを代用）。
        </p>
        {fieldErrors.thumbnail_alt && <p className={styles.fieldError}>{fieldErrors.thumbnail_alt}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          説明文（メタディスクリプション）
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={init.description}
          className={styles.input}
          rows={3}
          maxLength={200}
        />
        <p className={styles.hint}>
          検索結果・SNSシェアに表示される要約（120字目安）。空欄なら本文から自動生成されます。
        </p>
        {fieldErrors.description && <p className={styles.fieldError}>{fieldErrors.description}</p>}
      </div>

      <div className={styles.field}>
        <span className={styles.label}>本文</span>
        <RichEditor name="content" defaultValue={init.content} onValueChange={scheduleDirtyCheck} />
      </div>

      <div className={styles.field}>
        <label htmlFor="published_at" className={styles.label}>
          公開日時
        </label>
        <input
          id="published_at"
          ref={publishedAtInputRef}
          type="datetime-local"
          defaultValue={toDatetimeLocal(news?.published_at ?? null)}
          className={styles.input}
        />
        <p className={styles.hint}>
          「公開する」押下時に適用。空欄なら現在時刻で公開。未来日時にすると予約公開（公開時刻まで閲覧不可）。
        </p>
        {fieldErrors.published_at && (
          <p className={styles.fieldError}>{fieldErrors.published_at}</p>
        )}
      </div>

      <div className={styles.actions}>
        {isPending && (
          <p className={styles.actionStatus} role="status" aria-live="polite">
            {isPublishPending ? '公開設定を保存しています...' : '下書きを保存しています...'}
          </p>
        )}
        <button
          type="button"
          className={styles.previewButton}
          disabled={isPending || !canPreview}
          onClick={handlePreview}
        >
          プレビュー
        </button>
        <button
          type="submit"
          name="intent"
          value="draft"
          className={styles.buttonSecondary}
          disabled={isPending || !canUseSecondary}
          aria-busy={isDraftPending}
          data-pending={isDraftPending ? 'true' : undefined}
          onClick={(e) => {
            if (isPublished) {
              if (!window.confirm('この記事を非公開（下書き）に戻しますか？')) {
                e.preventDefault();
                return;
              }
            }
            setIntent('draft');
            syncPublishedAt();
          }}
        >
          {isDraftPending ? secondaryPendingLabel : secondaryLabel}
        </button>
        <button
          type="submit"
          name="intent"
          value="publish"
          className={styles.buttonPrimary}
          disabled={isPending || !canUsePrimary}
          aria-busy={isPublishPending}
          data-pending={isPublishPending ? 'true' : undefined}
          onClick={() => {
            setIntent('publish');
            syncPublishedAt();
          }}
        >
          {isPublishPending ? primaryPendingLabel : primaryLabel}
        </button>
      </div>
    </form>
  );
}
