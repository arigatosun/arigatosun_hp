-- アリガトくんチャット（/about/member/arigato-kun）の質問ログ。
-- 目的: GA では見えない「どんな質問が来たか／未分類（拾えなかった）質問」を把握し FAQ 強化に使う。
--
-- 個人情報リスクを下げる設計（重要）:
--   - IP アドレスは保存しない（本文と紐付けない＝個人特定性を下げる）。
--   - question はサーバー側でマスキング済み（メール/電話/数字列/URL を伏字化）の文字列のみ。
--   - 保持期間は 90 日（自動削除は別マイグレーション 20260629000100 の pg_cron ジョブ）。
--   - 閲覧は管理画面（authenticated）のみ。anon には一切公開しない。
--   - 書き込みは公開ルートから service_role クライアントで行う（RLS をバイパスするため
--     INSERT ポリシーは不要）。
--
-- 適用方法（いずれか）:
--   1. Supabase ダッシュボード → SQL Editor にこの内容を貼って実行
--   2. CLI: supabase link --project-ref <ref> 後に `supabase db push`
-- 適用後、型を再生成すること:
--   supabase gen types typescript --project-id <ref> > src/types/supabase.ts

create table if not exists public.arigato_chat_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- マスキング済みの質問本文（メール/電話/数字列/URL を伏字化済み）。生 PII は入れない。
  question text not null,
  -- 話題カテゴリ（FAQ キーワードによる自動分類）。未分類は 'unknown'。
  topic text not null,
  -- 元の質問の文字数（傾向把握用）。
  char_count integer not null
);

comment on table public.arigato_chat_logs is 'アリガトくんチャットの質問ログ。質問本文はマスキング済み・IP非保存・90日で自動削除。';
comment on column public.arigato_chat_logs.question is 'マスキング済み質問本文（メール/電話/数字列/URLを伏字化）。';
comment on column public.arigato_chat_logs.topic is 'FAQキーワードによる話題カテゴリ。未分類は unknown。';
comment on column public.arigato_chat_logs.char_count is '元の質問の文字数。';

-- 保持ジョブの削除・管理画面の並び替え用。
create index if not exists arigato_chat_logs_created_at_idx
  on public.arigato_chat_logs (created_at desc);
-- 話題カテゴリでの集計・絞り込み用。
create index if not exists arigato_chat_logs_topic_idx
  on public.arigato_chat_logs (topic);

-- RLS: 既定で全拒否。authenticated（管理者）のみ閲覧・削除を許可する。
-- INSERT は公開ルートの service_role クライアントが RLS をバイパスして行うため、ポリシー不要。
alter table public.arigato_chat_logs enable row level security;

drop policy if exists "authenticated can read chat logs" on public.arigato_chat_logs;
create policy "authenticated can read chat logs"
  on public.arigato_chat_logs
  for select
  to authenticated
  using (true);

drop policy if exists "authenticated can delete chat logs" on public.arigato_chat_logs;
create policy "authenticated can delete chat logs"
  on public.arigato_chat_logs
  for delete
  to authenticated
  using (true);
