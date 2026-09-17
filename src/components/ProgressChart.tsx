"use client";

import type { ChartPoint } from "@/lib/dashboard-stats";

interface ProgressChartProps {
  data: ChartPoint[];
  subtitle: string;
}

const BAR_WIDTH = 56;

export function ProgressChart({ data, subtitle }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-52 text-sub text-sm">
        No sessions in this time range — take a test to see your progress!
      </div>
    );
  }

  const maxWpm = Math.max(...data.map((d) => d.value), 1);
  const needsScroll = data.length * BAR_WIDTH > 600;

  return (
    <div className="space-y-4">
      <div
        className={`pb-2 ${needsScroll ? "overflow-x-auto" : "overflow-visible"}`}
      >
        <div
          className="flex items-end gap-2 h-52 justify-start"
          style={
            needsScroll
              ? { minWidth: `${data.length * BAR_WIDTH}px` }
              : undefined
          }
        >
          {data.map((point) => {
            const height = Math.max((point.value / maxWpm) * 100, 12);

            return (
              <div
                key={point.key}
                className="flex flex-col items-center gap-1 shrink-0"
                style={{ width: `${BAR_WIDTH}px` }}
              >
                <span className="text-[11px] font-mono text-accent h-4">
                  {point.value}
                </span>
                <div className="w-full flex items-end justify-center h-36">
                  <div
                    className="w-8 bg-accent rounded-t-md"
                    style={{ height: `${height}%` }}
                    title={`${point.value} wpm · ${point.accuracy ?? 0}% acc`}
                  />
                </div>
                <span className="text-[9px] text-sub text-center leading-tight w-full">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-sub text-xs text-center">{subtitle}</p>
    </div>
  );
}
