'use client';

import { useActionState, useRef } from 'react';
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

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewsForm({ news, categories, initialValues }: NewsFormProps) {
  const [state, formAction, isPending] = useActionState(saveNews, initialState);
  const intentRef = useRef<HTMLInputElement>(null);
  const isPublished = news?.status === 'published';
  const fieldErrors = 'fieldErrors' in state ? (state.fieldErrors ?? {}) : {};
  const globalError = 'error' in state ? state.error : null;

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
  // FormData に乗らないケースがあるため、hidden input + onClick で明示的に intent を渡す
  const setIntent = (value: 'draft' | 'publish') => {
    if (intentRef.current) intentRef.current.value = value;
  };

  return (
    <form action={formAction} className={styles.root}>
      {news && <input type="hidden" name="id" value={news.id} />}
      <input ref={intentRef} type="hidden" name="intent" defaultValue="draft" />

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
        <RichEditor name="content" defaultValue={init.content} />
      </div>

      <div className={styles.field}>
        <label htmlFor="published_at" className={styles.label}>
          公開日時
        </label>
        <input
          id="published_at"
          name="published_at"
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
        <button
          type="submit"
          className={styles.buttonSecondary}
          disabled={isPending}
          onClick={(e) => {
            if (isPublished) {
              if (!window.confirm('この記事を非公開（下書き）に戻しますか？')) {
                e.preventDefault();
                return;
              }
            }
            setIntent('draft');
          }}
        >
          {isPending ? '保存中...' : isPublished ? '下書きに戻す' : '下書きとして保存'}
        </button>
        <button
          type="submit"
          className={styles.buttonPrimary}
          disabled={isPending}
          onClick={() => setIntent('publish')}
        >
          {isPending ? '保存中...' : isPublished ? '公開情報を更新' : '公開する'}
        </button>
      </div>
    </form>
  );
}
