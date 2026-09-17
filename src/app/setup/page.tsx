"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoIcon } from "@/components/Icons";
import { checkDatabaseReady } from "@/lib/supabase/sessions";

const SETUP_SQL = `-- Paste this in Supabase SQL Editor and click Run

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
  on typing_sessions for insert with check (auth.uid() = user_id);`;

export default function SetupPage() {
  const [dbReady, setDbReady] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);

  const check = () => {
    checkDatabaseReady().then((result) => setDbReady(result.ready));
  };

  useEffect(() => {
    check();
  }, []);

  const copySql = () => {
    navigator.clipboard.writeText(SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <span className="text-2xl font-semibold">
            <span className="text-main">type</span>
            <span className="text-accent">ninja</span>
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-main mb-2">
            Database setup
          </h1>
          <p className="text-sub">
            Your Supabase project is connected, but the tables haven&apos;t been
            created yet. That&apos;s why your test results aren&apos;t saving.
          </p>
        </div>

        {dbReady === true ? (
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-6 text-accent">
            Database is ready!{" "}
            <Link href="/dashboard" className="underline">
              Go to dashboard
            </Link>
          </div>
        ) : (
          <div className="bg-bg-elevated border border-white/5 rounded-xl p-6 space-y-4">
            <h2 className="text-main font-semibold">Steps:</h2>
            <ol className="text-sub text-sm space-y-3 list-decimal list-inside">
              <li>
                Open the{" "}
                <a
                  href="https://supabase.com/dashboard/project/lkvktfrluhgezamzqzhf/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Supabase SQL Editor
                </a>
              </li>
              <li>Click &quot;Copy SQL&quot; below and paste it into the editor</li>
              <li>Click <strong className="text-main">Run</strong></li>
              <li>Come back here and click &quot;Check again&quot;</li>
            </ol>

            <button
              onClick={copySql}
              className="bg-accent text-bg font-semibold px-4 py-2 rounded-lg text-sm hover:bg-accent-dim transition-colors"
            >
              {copied ? "Copied!" : "Copy SQL"}
            </button>

            <button
              onClick={check}
              className="text-sub hover:text-main text-sm ml-4"
            >
              Check again
            </button>
          </div>
        )}

        <Link href="/" className="text-sub text-sm hover:text-main">
          ← Back to typing test
        </Link>
      </div>
    </div>
  );
}
