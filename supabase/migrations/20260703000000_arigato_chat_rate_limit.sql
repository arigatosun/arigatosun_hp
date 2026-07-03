-- アリガトくんチャットの濫用・課金インフレ対策。
-- 目的:
--   - サーバーレスでインスタンスをまたぐと無効化する route.ts のインメモリ制限を、
--     Supabase 上の共有カウンターで補強する（IP単位の永続レート制限）。
--   - サイト全体の1日あたり総リクエスト数に上限を設け、超過時は Claude を呼ばず
--     クライアントが定型FAQへ自動フォールバックできるようにする（サーキットブレーカー）。
--
-- 個人情報配慮（既存の arigato_chat_logs と同じ思想）:
--   - 生IPは保存しない。route.ts 側で SHA-256 ハッシュ化した ip_hash のみ保持する。
--   - レート用の行は短命（1時間窓）で pg_cron が自動削除する（別ファイル 20260703000100）。
--
-- 適用後、型を再生成すること（このプロジェクトは Supabase MCP の
-- generate_typescript_types を使い src/types/supabase.ts を更新する）。

-- 1) IP単位の永続レート制限（1時間の固定窓）。ip_hash は生IPではなくハッシュ。
create table if not exists public.arigato_chat_rate (
  ip_hash text not null,
  window_start timestamptz not null, -- date_trunc('hour', now())
  count integer not null default 0,
  primary key (ip_hash, window_start)
);

comment on table public.arigato_chat_rate is
  'アリガトくんチャットのIP単位レート制限カウンター。ip_hashはSHA-256（生IP非保存）、1時間窓、pg_cronで自動削除。';

-- 古い窓のクリーンアップ（pg_cron）で使用。
create index if not exists arigato_chat_rate_window_idx
  on public.arigato_chat_rate (window_start);

-- 2) サイト全体の1日総量カウンター（サーキットブレーカー）。JST日付でキー。
create table if not exists public.arigato_chat_daily (
  day date primary key,
  count integer not null default 0
);

comment on table public.arigato_chat_daily is
  'アリガトくんチャットの1日あたり総リクエスト数（JST日付）。上限超過で定型FAQへフォールバック。';

alter table public.arigato_chat_rate enable row level security;
alter table public.arigato_chat_daily enable row level security;

-- 管理画面（authenticated）から日次利用状況を将来参照できるように daily のみ SELECT 許可。
-- rate テーブルは完全に内部用途のためポリシーを付けない（anon/authenticated からは不可視）。
drop policy if exists "authenticated can read chat daily" on public.arigato_chat_daily;
create policy "authenticated can read chat daily"
  on public.arigato_chat_daily
  for select
  to authenticated
  using (true);

-- 3) 原子的ゲート関数。IPを先に判定し、超過IPは daily を消費しない
--    （1IPの攻撃で全体の1日枠を食い潰さないようにする）。
--    戻り値: 'ok' | 'rate_limited' | 'daily_cap'。
create or replace function public.arigato_chat_gate(
  p_ip_hash text,
  p_ip_hourly_limit integer,
  p_daily_limit integer
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hour timestamptz := date_trunc('hour', now());
  v_day date := (now() at time zone 'Asia/Tokyo')::date;
  v_ip_count integer;
  v_daily_count integer;
begin
  -- IP単位（1時間窓）を先に増分・判定。
  insert into public.arigato_chat_rate as r (ip_hash, window_start, count)
    values (p_ip_hash, v_hour, 1)
    on conflict (ip_hash, window_start)
      do update set count = r.count + 1
    returning count into v_ip_count;

  if v_ip_count > p_ip_hourly_limit then
    return 'rate_limited';
  end if;

  -- サイト全体の1日総量を増分・判定。
  insert into public.arigato_chat_daily as d (day, count)
    values (v_day, 1)
    on conflict (day)
      do update set count = d.count + 1
    returning count into v_daily_count;

  if v_daily_count > p_daily_limit then
    return 'daily_cap';
  end if;

  return 'ok';
end;
$$;

comment on function public.arigato_chat_gate(text, integer, integer) is
  'アリガトくんチャットの濫用ゲート。IP時間窓と1日総量を原子的に判定し ok/rate_limited/daily_cap を返す。';

-- 実行は service_role（公開ルートの管理クライアント）からのみ。anon には付与しない。
revoke all on function public.arigato_chat_gate(text, integer, integer) from public;
grant execute on function public.arigato_chat_gate(text, integer, integer) to service_role;
