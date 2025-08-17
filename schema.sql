-- Supabase schema for 'leads' table + RLS
create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_name text,
  phone text,
  email text,
  area_ping numeric,
  category text,
  source text,
  notes text
);

-- Enable RLS
alter table public.leads enable row level security;

-- Allow anonymous inserts (for optional front-end direct insert)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='leads' and policyname='anon can insert leads'
  ) then
    create policy "anon can insert leads"
      on public.leads
      for insert
      to anon
      with check (true);
  end if;
end $$;

-- (No select/update/delete for anon by default)
