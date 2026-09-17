"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoIcon } from "@/components/Icons";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: username },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <LogoIcon />
          <span className="text-3xl font-semibold">
            <span className="text-main">type</span>
            <span className="text-accent">ninja</span>
          </span>
        </div>

        <form
          onSubmit={handleRegister}
          className="bg-bg-elevated border border-white/5 rounded-xl p-8 space-y-5"
        >
          <h1 className="text-xl font-semibold text-main text-center">
            Create account
          </h1>

          {error && (
            <p className="text-error text-sm text-center bg-error/10 rounded-lg py-2 px-3">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sub text-sm mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2.5 text-main focus:outline-none focus:border-accent/50"
              placeholder="ninja_typist"
            />
          </div>

          <div>
            <label className="block text-sub text-sm mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2.5 text-main focus:outline-none focus:border-accent/50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sub text-sm mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-bg border border-white/10 rounded-lg px-4 py-2.5 text-main focus:outline-none focus:border-accent/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-dim text-bg font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="text-sub text-sm text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </form>

        <p className="text-sub text-sm text-center mt-6">
          <Link href="/" className="hover:text-main transition-colors">
            ← Back to typing test
          </Link>
        </p>
      </div>
    </div>
  );
}
