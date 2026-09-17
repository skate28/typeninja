-- TypeNinja Supabase schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Typing sessions
create table if not exists typing_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null default 'time',
  duration_seconds integer not null,
  wpm integer not null default 0,
  raw_wpm integer not null default 0,
  accuracy integer not null default 0,
  correct_chars integer not null default 0,
  incorrect_chars integer not null default 0,
  extra_chars integer not null default 0,
  completed_at timestamptz not null default now(),
  created_at timestamptz default now()
);

create index if not exists typing_sessions_user_id_idx on typing_sessions(user_id);
create index if not exists typing_sessions_completed_at_idx on typing_sessions(completed_at desc);

alter table typing_sessions enable row level security;

create policy "Users can read own sessions"
  on typing_sessions for select using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on typing_sessions for insert with check (auth.uid() = user_id);

-- Daily stats view for dashboard
create or replace view daily_stats as
select
  user_id,
  date(completed_at) as day,
  count(*) as tests_count,
  round(avg(wpm)) as avg_wpm,
  round(avg(accuracy)) as avg_accuracy,
  max(wpm) as best_wpm
from typing_sessions
group by user_id, date(completed_at);
