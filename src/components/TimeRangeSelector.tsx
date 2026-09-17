"use client";

import {
  TIME_RANGE_OPTIONS,
  type TimeRange,
} from "@/lib/dashboard-stats";

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onSelect: (range: TimeRange) => void;
}

export function TimeRangeSelector({
  selected,
  onSelect,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {TIME_RANGE_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            selected === option.value
              ? "text-accent underline underline-offset-4"
              : "text-sub hover:text-main"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
