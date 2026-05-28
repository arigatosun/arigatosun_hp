'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdminUser } from './_lib/auth-guard';
import type { TablesInsert, TablesUpdate } from '@/types/supabase';

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const SLUG_MAX = 50;
const LABEL_MAX = 100;

interface ParsedForm {
  slug: string;
  label: string;
  display_order: number;
}

type CategoryField = 'slug' | 'label' | 'display_order';

function parseForm(
  formData: FormData,
): { value: ParsedForm } | { error: string; field?: CategoryField } {
  const slug = String(formData.get('slug') ?? '').trim();
  const label = String(formData.get('label') ?? '').trim();
  const display_order_raw = String(formData.get('display_order') ?? '0').trim();
  const display_order = Number.parseInt(display_order_raw, 10);

  if (!slug) {
    return { error: 'スラッグを入力してください', field: 'slug' };
  }
  if (slug.length > SLUG_MAX) {
    return { error: `スラッグは${SLUG_MAX}文字以内で入力してください`, field: 'slug' };
  }
  if (!SLUG_PATTERN.test(slug)) {
    return {
      error: '半角英小文字・数字・ハイフンのみ使用できます（先頭末尾はハイフン不可）',
      field: 'slug',
    };
  }

  if (!label) {
    return { error: 'ラベルを入力してください', field: 'label' };
  }
  if (label.length > LABEL_MAX) {
    return { error: `ラベルは${LABEL_MAX}文字以内で入力してください`, field: 'label' };
  }

  if (Number.isNaN(display_order)) {
    return { error: '表示順は整数で入力してください', field: 'display_order' };
  }

  return { value: { slug, label, display_order } };
}

function formatPostgresError(error: { code?: string; message: string }): string {
  if (error.code === '23505') {
    return '同じスラッグのカテゴリーが既に存在します';
  }
  if (error.code === '23503') {
    return 'このカテゴリーは記事で使用中のため削除できません';
  }
  console.error('[categories action] unexpected DB error', error);
  return 'データベースエラーが発生しました。時間をおいて再度お試しください。';
}

/**
 * 新規作成 / 更新 を兼ねる Server Action。
 * formData.get('id') が空なら新規、値があれば更新。
 */
export async function saveCategory(formData: FormData): Promise<void> {
  const { supabase } = await requireAdminUser();
  const id = String(formData.get('id') ?? '').trim() || null;
  const parsed = parseForm(formData);

  if ('error' in parsed) {
    const fieldPart = parsed.field ? `&field=${parsed.field}` : '';
    const target = id ? `&id=${encodeURIComponent(id)}` : '&new=1';
    redirect(`/admin/categories?error=${encodeURIComponent(parsed.error)}${fieldPart}${target}`);
  }


  if (id) {
    const update: TablesUpdate<'categories'> = {
      slug: parsed.value.slug,
      label: parsed.value.label,
      display_order: parsed.value.display_order,
    };
    const { error } = await supabase.from('categories').update(update).eq('id', id);
    if (error) {
      redirect(
        `/admin/categories?error=${encodeURIComponent(formatPostgresError(error))}&id=${encodeURIComponent(id)}`,
      );
    }
  } else {
    const insert: TablesInsert<'categories'> = parsed.value;
    const { error } = await supabase.from('categories').insert(insert);
    if (error) {
      redirect(`/admin/categories?error=${encodeURIComponent(formatPostgresError(error))}&new=1`);
    }
  }

  revalidatePath('/admin/categories');
  revalidatePath('/admin/news');
  redirect(`/admin/categories?saved=1${id ? `&id=${encodeURIComponent(id)}` : ''}`);
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const { supabase } = await requireAdminUser();
  const id = String(formData.get('id') ?? '').trim();
  if (!id) {
    redirect('/admin/categories?error=削除対象が指定されていません');
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) {
    redirect(
      `/admin/categories?error=${encodeURIComponent(formatPostgresError(error))}&id=${encodeURIComponent(id)}`,
    );
  }
  revalidatePath('/admin/categories');
  redirect('/admin/categories?deleted=1');
}
