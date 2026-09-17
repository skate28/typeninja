export type TimeRange = "today" | "7" | "30" | "60" | "90" | "all";

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "all", label: "All time" },
];

export interface SessionRecord {
  id: string;
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  duration_seconds: number;
  completed_at: string;
}

export interface ChartPoint {
  key: string;
  label: string;
  value: number;
  bestWpm?: number;
  testsCount?: number;
  accuracy?: number;
}

export interface RangeTotals {
  tests: number;
  bestWpm: number;
  avgWpm: number;
  avgAcc: number;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Group sessions by local calendar day (not UTC) */
function getLocalDayKey(iso: string): string {
  return formatDayKey(new Date(iso));
}

function getRangeStart(range: TimeRange, now = new Date()): Date | null {
  const today = startOfDay(now);
  switch (range) {
    case "today":
      return today;
    case "7":
      return new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    case "30":
      return new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
    case "60":
      return new Date(today.getTime() - 59 * 24 * 60 * 60 * 1000);
    case "90":
      return new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000);
    case "all":
      return null;
  }
}

export function filterSessionsByRange(
  sessions: SessionRecord[],
  range: TimeRange
): SessionRecord[] {
  const start = getRangeStart(range);
  if (!start) return sessions;

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return sessions.filter((s) => {
    const date = new Date(s.completed_at);
    return date >= start && date <= end;
  });
}

export function computeTotals(sessions: SessionRecord[]): RangeTotals {
  if (sessions.length === 0) {
    return { tests: 0, bestWpm: 0, avgWpm: 0, avgAcc: 0 };
  }
  return {
    tests: sessions.length,
    bestWpm: Math.max(...sessions.map((s) => s.wpm)),
    avgWpm: Math.round(
      sessions.reduce((a, s) => a + s.wpm, 0) / sessions.length
    ),
    avgAcc: Math.round(
      sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length
    ),
  };
}

function formatChartLabel(iso: string, range: TimeRange): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (range === "today") return time;

  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${date} ${time}`;
}

/** One bar per test, oldest on the left → newest on the right */
export function buildChartData(
  sessions: SessionRecord[],
  range: TimeRange
): ChartPoint[] {
  const filtered = filterSessionsByRange(sessions, range);

  return [...filtered]
    .sort(
      (a, b) =>
        new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
    )
    .map((s) => ({
      key: s.id,
      label: formatChartLabel(s.completed_at, range),
      value: s.wpm,
      accuracy: s.accuracy,
      testsCount: 1,
    }));
}

export function getChartSubtitle(range: TimeRange): string {
  switch (range) {
    case "today":
      return "WPM per test today — oldest to newest, left to right";
    case "7":
      return "WPM per test (last 7 days) — oldest to newest, left to right";
    case "30":
      return "WPM per test (last 30 days) — oldest to newest, left to right";
    case "60":
      return "WPM per test (last 60 days) — oldest to newest, left to right";
    case "90":
      return "WPM per test (last 90 days) — oldest to newest, left to right";
    case "all":
      return "WPM per test (all time) — oldest to newest, left to right";
  }
}
