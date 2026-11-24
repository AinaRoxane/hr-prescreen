-- Table: public.screenings
-- RLS is enabled. There are NO policies for the anon or authenticated roles,
-- so only the server (service_role key) can read or write. The application
-- never stores CV or job-ad text, only the screening result (score + JSON).

create table if not exists public.screenings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  score int not null check (score between 0 and 100),
  result jsonb not null
);

alter table public.screenings enable row level security;

revoke all on table public.screenings from anon, authenticated;

grant usage on schema public to service_role;
grant all on table public.screenings to service_role;