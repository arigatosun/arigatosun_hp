-- WebMCP rollout flags. Public access is denied; Route Handlers use service_role.
create table if not exists public.webmcp_runtime_config (
  key text primary key check (key in ('read_tools', 'prepare_contact', 'submit_contact')),
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.webmcp_runtime_config (key, enabled)
values ('read_tools', false), ('prepare_contact', false), ('submit_contact', false)
on conflict (key) do nothing;

alter table public.webmcp_runtime_config enable row level security;
revoke all on public.webmcp_runtime_config from anon, authenticated;

