import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { saveCategory, deleteCategory } from '../../_actions/categories';
import ConfirmForm from '../../_components/ConfirmForm';
import PendingSubmitButton from '../../_components/PendingSubmitButton';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'カテゴリー管理',
};

interface CategoriesPageProps {
  searchParams: Promise<{
    error?: string;
    saved?: string;
    deleted?: string;
    id?: string;
    field?: string;
    new?: string;
  }>;
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: categories, error: fetchError } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  const errorTargetId = params.error ? params.id ?? null : null;
  const errorIsNew = params.error && params.new === '1';
  const errorField = params.field ?? null;
  const savedTargetId = params.saved === '1' ? (params.id ?? null) : null;
  const savedIsNew = params.saved === '1' && !params.id;

  const maxOrder = categories?.reduce((acc, c) => Math.max(acc, c.display_order), 0) ?? 0;
  const defaultNewOrder = maxOrder + 1;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>カテゴリー管理</h1>
      </header>

      {params.deleted === '1' && (
        <p className={styles.banner} role="status">
          カテゴリーを削除しました
        </p>
      )}
      {params.error && !errorTargetId && !errorIsNew && (
        <p className={styles.bannerError} role="alert">
          {params.error}
        </p>
      )}
      {fetchError && (
        <p className={styles.bannerError} role="alert">
          カテゴリーの取得に失敗しました: {fetchError.message}
        </p>
      )}

      <p className={styles.note}>
        ニュース記事から参照中のカテゴリーは削除できません。スラッグは半角英小文字・数字・ハイフンのみ。
      </p>

      <section>
        <h2 className={styles.sectionTitle}>既存のカテゴリー</h2>
        {categories && categories.length > 0 ? (
          <ul className={styles.list}>
            {categories.map((c) => {
              const isEditError = errorTargetId === c.id;
              const isSavedRow = savedTargetId === c.id;
              return (
                <li key={c.id} className={styles.row}>
                  {/* 編集フォーム。削除フォームを内部にネストすると HTML として不正になるので分離 */}
                  <form action={saveCategory} className={styles.form}>
                    <input type="hidden" name="id" value={c.id} />
                    <div className={styles.fieldGroup}>
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>スラッグ</span>
                        <input
                          type="text"
                          name="slug"
                          required
                          defaultValue={c.slug}
                          maxLength={50}
                          pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
                          className={`${styles.input} ${isEditError && errorField === 'slug' ? styles.inputError : ''}`}
                        />
                      </label>
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>ラベル</span>
                        <input
                          type="text"
                          name="label"
                          required
                          defaultValue={c.label}
                          maxLength={100}
                          className={`${styles.input} ${isEditError && errorField === 'label' ? styles.inputError : ''}`}
                        />
                      </label>
                      <label className={`${styles.field} ${styles.fieldOrder}`}>
                        <span className={styles.fieldLabel}>表示順</span>
                        <input
                          type="number"
                          name="display_order"
                          defaultValue={c.display_order}
                          step={1}
                          className={`${styles.input} ${isEditError && errorField === 'display_order' ? styles.inputError : ''}`}
                        />
                      </label>
                    </div>
                    {isEditError && (
                      <p className={styles.rowError} role="alert">
                        {params.error}
                      </p>
                    )}
                    {isSavedRow && (
                      <p className={styles.rowSuccess} role="status">
                        保存しました
                      </p>
                    )}
                    <div className={styles.rowActions}>
                      <PendingSubmitButton className={styles.saveBtn} pendingLabel="保存中...">
                        保存
                      </PendingSubmitButton>
                    </div>
                  </form>
                  {/* 削除は別フォームとして並列に置く（form のネスト不可のため） */}
                  <ConfirmForm
                    action={deleteCategory}
                    message={`カテゴリー「${c.label}」を削除します。よろしいですか？\n（このカテゴリーを使用している記事があると削除できません）`}
                    className={styles.deleteForm}
                  >
                    <input type="hidden" name="id" value={c.id} />
                    <PendingSubmitButton className={styles.deleteBtn} pendingLabel="削除中...">
                      削除
                    </PendingSubmitButton>
                  </ConfirmForm>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.empty}>カテゴリーがまだありません。</p>
        )}
      </section>

      <section>
        <h2 className={styles.sectionTitle}>新規追加</h2>
        <form action={saveCategory} className={`${styles.form} ${styles.formNew}`}>
          <div className={styles.fieldGroup}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>スラッグ</span>
              <input
                type="text"
                name="slug"
                required
                maxLength={50}
                pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
                placeholder="例: announcement"
                className={`${styles.input} ${errorIsNew && errorField === 'slug' ? styles.inputError : ''}`}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>ラベル</span>
              <input
                type="text"
                name="label"
                required
                maxLength={100}
                placeholder="例: ANNOUNCEMENT"
                className={`${styles.input} ${errorIsNew && errorField === 'label' ? styles.inputError : ''}`}
              />
            </label>
            <label className={`${styles.field} ${styles.fieldOrder}`}>
              <span className={styles.fieldLabel}>表示順</span>
              <input
                type="number"
                name="display_order"
                defaultValue={defaultNewOrder}
                step={1}
                className={`${styles.input} ${errorIsNew && errorField === 'display_order' ? styles.inputError : ''}`}
              />
            </label>
          </div>
          {errorIsNew && (
            <p className={styles.rowError} role="alert">
              {params.error}
            </p>
          )}
          {savedIsNew && (
            <p className={styles.rowSuccess} role="status">
              追加しました
            </p>
          )}
          <div className={styles.rowActions}>
            <PendingSubmitButton className={styles.saveBtn} pendingLabel="追加中...">
              + 追加
            </PendingSubmitButton>
          </div>
        </form>
      </section>
    </div>
  );
}
