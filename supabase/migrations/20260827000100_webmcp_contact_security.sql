create extension if not exists pgcrypto;

-- No contact PII is stored. Hashes bind approvals to the reviewed payload/session.
create table if not exists public.webmcp_contact_approvals (
  id uuid primary key default gen_random_uuid(),
  payload_hash text not null check (length(payload_hash) = 64),
  session_hash text not null check (length(session_hash) = 64),
  ip_hash text not null check (length(ip_hash) = 64),
  idempotency_key_hash text not null unique check (length(idempotency_key_hash) = 64),
  inquiry_type text not null check (inquiry_type in ('project_request', 'estimate_consultation')),
  privacy_policy_version text not null check (length(privacy_policy_version) between 1 and 64),
  privacy_consented_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'consumed', 'expired')),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_submission_receipts (
  idempotency_key text primary key check (length(idempotency_key) between 1 and 200),
  public_receipt_id uuid not null unique default gen_random_uuid(),
  source text not null check (source in ('manual_form', 'webmcp', 'legacy_manual')),
  payload_hash text not null check (length(payload_hash) = 64),
  privacy_policy_version text not null check (length(privacy_policy_version) between 1 and 64),
  privacy_consented_at timestamptz not null,
  status text not null default 'processing' check (status in ('processing', 'sent', 'failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.webmcp_contact_rate (
  ip_hash text not null check (length(ip_hash) = 64),
  bucket_start timestamptz not null,
  hit_count integer not null default 0 check (hit_count > 0),
  primary key (ip_hash, bucket_start)
);

create table if not exists public.webmcp_audit_logs (
  id bigint generated always as identity primary key,
  request_id uuid not null,
  event text not null,
  tool_name text,
  outcome text not null,
  inquiry_type text,
  payload_hash text,
  session_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.webmcp_contact_approvals enable row level security;
alter table public.contact_submission_receipts enable row level security;
alter table public.webmcp_contact_rate enable row level security;
alter table public.webmcp_audit_logs enable row level security;
revoke all on public.webmcp_contact_approvals, public.contact_submission_receipts,
  public.webmcp_contact_rate, public.webmcp_audit_logs from anon, authenticated;

create or replace function public.webmcp_contact_gate(
  p_ip_hash text,
  p_limit integer default 5,
  p_window_seconds integer default 600
) returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_bucket timestamptz;
  v_count integer;
begin
  if length(p_ip_hash) <> 64 or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;
  v_bucket := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.webmcp_contact_rate(ip_hash, bucket_start, hit_count)
  values (p_ip_hash, v_bucket, 1)
  on conflict (ip_hash, bucket_start)
  do update set hit_count = public.webmcp_contact_rate.hit_count + 1
  returning hit_count into v_count;
  return v_count <= p_limit;
end;
$$;

create or replace function public.webmcp_claim_contact_submission(
  p_approval_id uuid,
  p_payload_hash text,
  p_session_hash text,
  p_idempotency_key text,
  p_idempotency_key_hash text
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_receipt_id uuid;
  v_existing_status text;
begin
  insert into public.contact_submission_receipts(
    idempotency_key, source, payload_hash, privacy_policy_version, privacy_consented_at
  )
  select p_idempotency_key, 'webmcp', p_payload_hash,
    privacy_policy_version, privacy_consented_at
  from public.webmcp_contact_approvals
  where id = p_approval_id
    and payload_hash = p_payload_hash
    and session_hash = p_session_hash
    and idempotency_key_hash = p_idempotency_key_hash
    and status = 'pending'
    and expires_at > now()
  on conflict do nothing
  returning public_receipt_id into v_receipt_id;

  if v_receipt_id is null then
    select status, public_receipt_id into v_existing_status, v_receipt_id
    from public.contact_submission_receipts
    where idempotency_key = p_idempotency_key
      and source = 'webmcp'
      and payload_hash = p_payload_hash;
    if v_receipt_id is not null then
      return jsonb_build_object('result', v_existing_status, 'public_receipt_id', v_receipt_id);
    end if;
    return jsonb_build_object('result', 'invalid_approval');
  end if;

  update public.webmcp_contact_approvals
  set status = 'consumed', consumed_at = now()
  where id = p_approval_id
    and status = 'pending'
    and expires_at > now()
    and payload_hash = p_payload_hash
    and session_hash = p_session_hash
    and idempotency_key_hash = p_idempotency_key_hash;
  if not found then
    delete from public.contact_submission_receipts where idempotency_key = p_idempotency_key;
    return jsonb_build_object('result', 'invalid_approval');
  end if;
  return jsonb_build_object('result', 'claimed', 'public_receipt_id', v_receipt_id);
end;
$$;

create or replace function public.claim_manual_contact_submission(
  p_payload_hash text,
  p_idempotency_key text,
  p_source text,
  p_privacy_policy_version text,
  p_privacy_consented_at timestamptz
) returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_receipt_id uuid;
  v_status text;
  v_existing_payload_hash text;
  v_existing_source text;
begin
  if p_source not in ('manual_form', 'legacy_manual') then
    return jsonb_build_object('result', 'invalid_source');
  end if;
  insert into public.contact_submission_receipts(
    idempotency_key, source, payload_hash, privacy_policy_version, privacy_consented_at
  ) values (
    p_idempotency_key, p_source, p_payload_hash, p_privacy_policy_version, p_privacy_consented_at
  )
  on conflict do nothing
  returning public_receipt_id into v_receipt_id;
  if v_receipt_id is not null then
    return jsonb_build_object('result', 'claimed', 'public_receipt_id', v_receipt_id);
  end if;
  select status, public_receipt_id, payload_hash, source
  into v_status, v_receipt_id, v_existing_payload_hash, v_existing_source
  from public.contact_submission_receipts
  where idempotency_key = p_idempotency_key;
  if v_receipt_id is null
     or v_existing_payload_hash <> p_payload_hash
     or v_existing_source <> p_source then
    return jsonb_build_object('result', 'conflict');
  end if;
  return jsonb_build_object('result', coalesce(v_status, 'processing'), 'public_receipt_id', v_receipt_id);
end;
$$;

revoke all on function public.webmcp_contact_gate(text, integer, integer) from public;
revoke execute on function public.webmcp_contact_gate(text, integer, integer) from anon, authenticated;
grant execute on function public.webmcp_contact_gate(text, integer, integer) to service_role;

revoke all on function public.webmcp_claim_contact_submission(uuid, text, text, text, text) from public;
revoke execute on function public.webmcp_claim_contact_submission(uuid, text, text, text, text) from anon, authenticated;
grant execute on function public.webmcp_claim_contact_submission(uuid, text, text, text, text) to service_role;

revoke all on function public.claim_manual_contact_submission(text, text, text, text, timestamptz) from public;
revoke execute on function public.claim_manual_contact_submission(text, text, text, text, timestamptz) from anon, authenticated;
grant execute on function public.claim_manual_contact_submission(text, text, text, text, timestamptz) to service_role;
