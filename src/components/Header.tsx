"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CrownIcon,
  InfoIcon,
  KeyboardIcon,
  LogoIcon,
  SettingsIcon,
  UserIcon,
} from "./Icons";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

function NavButton({
  children,
  active = false,
  href,
}: {
  children: React.ReactNode;
  active?: boolean;
  href?: string;
}) {
  const className = `p-2 rounded-md transition-colors ${
    active ? "text-accent" : "text-sub hover:text-main"
  }`;

  if (href) {
    return (
      <Link href={href} className={className} aria-label="Navigation">
        {children}
      </Link>
    );
  }

  return (
    <button className={className} aria-label="Navigation">
      {children}
    </button>
  );
}

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 max-w-[1600px] mx-auto w-full border-b border-white/5">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <LogoIcon />
          <span className="text-2xl font-semibold tracking-tight hidden sm:inline">
            <span className="text-main">type</span>
            <span className="text-accent">ninja</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 ml-2">
          <NavButton active href="/">
            <KeyboardIcon />
          </NavButton>
          <NavButton href="/dashboard">
            <CrownIcon />
          </NavButton>
          <NavButton>
            <InfoIcon />
          </NavButton>
          <NavButton>
            <SettingsIcon />
          </NavButton>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="text-sub text-sm hover:text-accent transition-colors hidden sm:inline truncate max-w-[160px]"
            >
              {user.email}
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sub text-sm hover:text-main transition-colors px-2"
            >
              sign out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sub text-sm hover:text-main transition-colors px-2"
            >
              sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-accent/10 text-accent hover:bg-accent/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              register
            </Link>
          </>
        )}
        <NavButton href={user ? "/dashboard" : "/login"}>
          <UserIcon />
        </NavButton>
      </div>
    </header>
  );
}
