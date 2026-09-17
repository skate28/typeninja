"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LogoIcon } from "@/components/Icons";
import { ProgressChart } from "@/components/ProgressChart";
import { TimeRangeSelector } from "@/components/TimeRangeSelector";
import {
  buildChartData,
  computeTotals,
  filterSessionsByRange,
  getChartSubtitle,
  type SessionRecord,
  type TimeRange,
} from "@/lib/dashboard-stats";
import {
  checkDatabaseReady,
  fetchAllSessions,
} from "@/lib/supabase/sessions";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("30");
  const [loading, setLoading] = useState(true);
  const [dbReady, setDbReady] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? null);

      const dbStatus = await checkDatabaseReady();
      setDbReady(dbStatus.ready);

      const allSessions = await fetchAllSessions();
      setSessions(allSessions);
      setLoading(false);
    };

    load();
  }, [router]);

  const filteredSessions = useMemo(
    () => filterSessionsByRange(sessions, timeRange),
    [sessions, timeRange]
  );

  const totals = useMemo(
    () => computeTotals(filteredSessions),
    [filteredSessions]
  );

  const chartData = useMemo(
    () => buildChartData(sessions, timeRange),
    [sessions, timeRange]
  );

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sub">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3">
          <LogoIcon />
          <span className="text-xl font-semibold">
            <span className="text-main">type</span>
            <span className="text-accent">ninja</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sub text-sm hidden sm:inline">{email}</span>
          <Link href="/" className="text-sm text-accent hover:underline">
            Practice
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-sub hover:text-main transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-10 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-main mb-1">
              Dashboard
            </h1>
            <p className="text-sub">Track your typing progress over time</p>
          </div>
          <TimeRangeSelector selected={timeRange} onSelect={setTimeRange} />
        </div>

        {!dbReady && (
          <div className="bg-error/10 border border-error/30 rounded-xl p-4 text-sm">
            <p className="text-error font-medium mb-1">
              Database not set up — sessions can&apos;t be saved yet.
            </p>
            <p className="text-sub">
              <Link href="/setup" className="text-accent hover:underline">
                Run the one-time database setup
              </Link>
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "tests", value: totals.tests },
            { label: "best wpm", value: totals.bestWpm },
            { label: "avg wpm", value: totals.avgWpm },
            { label: "avg acc", value: `${totals.avgAcc}%` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-bg-elevated border border-white/5 rounded-xl p-5 text-center"
            >
              <div className="text-sub text-xs uppercase tracking-wide mb-1">
                {stat.label}
              </div>
              <div className="text-3xl font-mono text-accent">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-bg-elevated border border-white/5 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-main mb-6">Progress</h2>
          <ProgressChart
            data={chartData}
            subtitle={getChartSubtitle(timeRange)}
          />
        </div>

        <div className="bg-bg-elevated border border-white/5 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-main mb-4">
            All tests
            <span className="text-sub text-sm font-normal ml-2">
              ({filteredSessions.length} in range)
            </span>
          </h2>
          {filteredSessions.length === 0 ? (
            <p className="text-sub text-sm">
              No sessions in this range.{" "}
              <Link href="/" className="text-accent hover:underline">
                Take a test
              </Link>
            </p>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-bg-elevated">
                  <tr className="text-sub border-b border-white/5">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Time</th>
                    <th className="text-right py-2 font-medium">Duration</th>
                    <th className="text-right py-2 font-medium">WPM</th>
                    <th className="text-right py-2 font-medium">Raw</th>
                    <th className="text-right py-2 font-medium">Acc</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions
                    .slice()
                    .reverse()
                    .map((session) => {
                      const date = new Date(session.completed_at);
                      return (
                        <tr
                          key={session.id}
                          className="border-b border-white/5 text-main hover:bg-white/2"
                        >
                          <td className="py-2.5">
                            {date.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-2.5 text-sub">
                            {date.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="text-right font-mono text-sub">
                            {session.duration_seconds}s
                          </td>
                          <td className="text-right font-mono text-accent">
                            {session.wpm}
                          </td>
                          <td className="text-right font-mono">
                            {session.raw_wpm}
                          </td>
                          <td className="text-right font-mono">
                            {session.accuracy}%
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
