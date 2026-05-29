-- news テーブルに SEO 用カラムを追加する。
--   description   : メタディスクリプション兼抜粋（任意。未設定時は本文から自動生成してフォールバック）
--   thumbnail_alt : サムネイル画像の alt テキスト（画像SEO / アクセシビリティ）
--
-- 適用方法（いずれか）:
--   1. Supabase ダッシュボード → SQL Editor にこの内容を貼って実行
--   2. CLI: supabase link --project-ref <ref> 後に `supabase db push`
-- 適用後、型を再生成すること:
--   supabase gen types typescript --project-id <ref> > src/types/supabase.ts

alter table public.news
  add column if not exists description text,
  add column if not exists thumbnail_alt text;

comment on column public.news.description is 'メタディスクリプション兼抜粋（120字目安）。未設定なら本文から自動生成する。';
comment on column public.news.thumbnail_alt is 'サムネイル画像の alt テキスト（画像SEO / アクセシビリティ）。';
