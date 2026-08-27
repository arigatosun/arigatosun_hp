create index if not exists webmcp_approvals_expires_idx on public.webmcp_contact_approvals(expires_at);
create index if not exists webmcp_audit_created_idx on public.webmcp_audit_logs(created_at);
create index if not exists contact_receipts_created_idx on public.contact_submission_receipts(created_at);

create or replace function public.cleanup_webmcp_data() returns void
language sql security definer set search_path = public
as $$
  delete from public.webmcp_contact_approvals
  where (status in ('pending', 'expired') and created_at < now() - interval '24 hours')
     or (status = 'consumed' and created_at < now() - interval '90 days');
  delete from public.webmcp_contact_rate where bucket_start < now() - interval '24 hours';
  delete from public.contact_submission_receipts where created_at < now() - interval '90 days';
  delete from public.webmcp_audit_logs where created_at < now() - interval '90 days';
$$;

revoke all on function public.cleanup_webmcp_data() from public;
revoke execute on function public.cleanup_webmcp_data() from anon, authenticated;
grant execute on function public.cleanup_webmcp_data() to service_role;

