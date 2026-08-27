-- Always apply this migration. Environments without pg_cron succeed with a NOTICE/WARNING.
do $$
begin
  begin
    execute 'create extension if not exists pg_cron';
  exception when others then
    raise notice 'pg_cron unavailable; retention cron was not scheduled: %', sqlstate;
    return;
  end;

  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron unavailable; retention cron was not scheduled';
    return;
  end if;

  begin
    execute 'select cron.unschedule(jobid) from cron.job where jobname = ''cleanup-webmcp-data''';
    execute 'select cron.schedule(''cleanup-webmcp-data'', ''17 3 * * *'', ''select public.cleanup_webmcp_data()'')';
  exception when others then
    raise warning 'retention cron registration skipped: %', sqlstate;
  end;
end $$;

