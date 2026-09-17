"use client";

import { TIME_OPTIONS, type TimeOption } from "@/lib/typing-utils";

interface TimeSelectorProps {
  selected: TimeOption;
  onSelect: (time: TimeOption) => void;
  disabled?: boolean;
}

export function TimeSelector({
  selected,
  onSelect,
  disabled = false,
}: TimeSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {TIME_OPTIONS.map((time) => (
        <button
          key={time}
          onClick={() => onSelect(time)}
          disabled={disabled}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            selected === time
              ? "text-accent underline underline-offset-4"
              : "text-sub hover:text-main"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {time}
        </button>
      ))}
    </div>
  );
}
