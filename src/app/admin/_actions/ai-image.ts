'use server';

import { GoogleGenAI, Modality } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

// 画像生成モデル（通称 Nano Banana Pro）。env で上書き可。
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-3-pro-image-preview';

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export type GenerateImageResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

/**
 * プロンプトから画像を生成し、news-images バケットに保存して公開 URL を返す。
 * - 認証必須
 * - 画像は Gemini（Nano Banana Pro）で生成 → Supabase Storage に保存
 * - aspectRatio: '16:9'（サムネ）/ '4:3' / '1:1'（本文）等
 */
export async function generateNewsImage(
  prompt: string,
  aspectRatio = '16:9',
): Promise<GenerateImageResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: '認証が必要です。再度ログインしてください' };
  }

  const p = (prompt ?? '').trim();
  if (!p) {
    return { ok: false, error: '画像の説明（プロンプト）を入力してください' };
  }
  if (!process.env.GEMINI_API_KEY) {
    return { ok: false, error: 'GEMINI_API_KEY が未設定です（サーバー環境変数を確認してください）' };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let dataB64: string | undefined;
  let mime = 'image/png';
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: p,
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: { aspectRatio },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        dataB64 = part.inlineData.data;
        mime = part.inlineData.mimeType ?? mime;
        break;
      }
    }
  } catch (err) {
    console.error('[ai-image] Gemini API error', err);
    const msg = err instanceof Error ? err.message : '生成に失敗しました';
    return { ok: false, error: `画像生成に失敗しました: ${msg}` };
  }

  if (!dataB64) {
    return { ok: false, error: '画像が生成されませんでした。プロンプトを変えて再度お試しください' };
  }

  const ext = EXT_BY_MIME[mime] ?? 'png';
  const buffer = Buffer.from(dataB64, 'base64');
  const year = new Date().getFullYear();
  const path = `news/${year}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('news-images')
    .upload(path, buffer, { contentType: mime, upsert: false });

  if (uploadError) {
    return { ok: false, error: `画像の保存に失敗しました: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('news-images').getPublicUrl(path);

  return { ok: true, url: publicUrl, path };
}
