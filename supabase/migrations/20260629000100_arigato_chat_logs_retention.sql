-- アリガトくんチャット質問ログの 90 日自動削除（pg_cron）。
-- 20260629000000_arigato_chat_logs.sql を適用した後に実行する。
--
-- 注意:
--   - pg_cron 拡張が必要。未有効ならまず Supabase ダッシュボード → Database → Extensions で
--     「pg_cron」を有効化してから本ファイルを実行する（`create extension` 行で失敗する場合）。
--   - テーブル作成とトランザクションを分けているのは、pg_cron 未対応環境でも
--     テーブル本体（前ファイル）が巻き戻らないようにするため。
--   - 自動削除が使えない環境では、代わりに手動 or 別途バッチで
--     `delete from public.arigato_chat_logs where created_at < now() - interval '90 days';`
--     を定期実行すればよい。

create extension if not exists pg_cron;

-- 毎日 03:00(UTC) に 90 日より古いログを削除する。既存ジョブがあれば付け替える。
select cron.unschedule('arigato-chat-logs-retention')
where exists (select 1 from cron.job where jobname = 'arigato-chat-logs-retention');

select cron.schedule(
  'arigato-chat-logs-retention',
  '0 3 * * *',
  $$delete from public.arigato_chat_logs where created_at < now() - interval '90 days'$$
);
