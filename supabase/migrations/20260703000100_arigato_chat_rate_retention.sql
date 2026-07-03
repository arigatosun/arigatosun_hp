-- アリガトくんチャットのレート制限テーブルの自動クリーンアップ（pg_cron）。
-- 20260703000000_arigato_chat_rate_limit.sql を適用した後に実行する。
--
-- 注意:
--   - pg_cron 拡張が必要（arigato_chat_logs の保持ジョブで既に有効化済みの想定）。
--     未有効なら Supabase ダッシュボード → Database → Extensions で有効化してから実行する。
--   - テーブル本体（前ファイル）と分けているのは、pg_cron 未対応環境でも
--     テーブルが巻き戻らないようにするため。
--   - 自動削除が使えない環境では、代わりに手動 or 別バッチで下記を定期実行すればよい。
--       delete from public.arigato_chat_rate where window_start < now() - interval '2 hours';

create extension if not exists pg_cron;

-- IP レート窓は短命。毎時5分に2時間より古い窓を削除する。
select cron.unschedule('arigato-chat-rate-cleanup')
where exists (select 1 from cron.job where jobname = 'arigato-chat-rate-cleanup');

select cron.schedule(
  'arigato-chat-rate-cleanup',
  '5 * * * *',
  $$delete from public.arigato_chat_rate where window_start < now() - interval '2 hours'$$
);

-- 日次カウンターは統計用に30日分だけ残す。毎日 03:10(UTC) に古い行を削除する。
select cron.unschedule('arigato-chat-daily-cleanup')
where exists (select 1 from cron.job where jobname = 'arigato-chat-daily-cleanup');

select cron.schedule(
  'arigato-chat-daily-cleanup',
  '10 3 * * *',
  $$delete from public.arigato_chat_daily where day < ((now() at time zone 'Asia/Tokyo')::date - 30)$$
);
