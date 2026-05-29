'use server';

import { createClient } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

/**
 * news-images バケットに画像をアップロードして公開 URL を返す。
 * - 認証必須（ログイン済みユーザーのみ）
 * - 5MB 以下 / jpg / png / webp / gif のみ受け付け
 * - パスは `news/YYYY/<uuid>.<ext>`
 */
export async function uploadNewsImage(formData: FormData): Promise<UploadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: '認証が必要です。再度ログインしてください' };
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false, error: 'ファイルが選択されていません' };
  }
  if (file.size === 0) {
    return { ok: false, error: '空のファイルはアップロードできません' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: 'ファイルサイズは 5MB 以下にしてください' };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { ok: false, error: '対応形式は jpg / png / webp / gif のみです' };
  }

  const ext = ALLOWED_EXT_MAP[file.type];
  const filename = `${crypto.randomUUID()}.${ext}`;
  const year = new Date().getFullYear();
  const path = `news/${year}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from('news-images')
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { ok: false, error: `アップロード失敗: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('news-images').getPublicUrl(path);

  return { ok: true, url: publicUrl, path };
}
