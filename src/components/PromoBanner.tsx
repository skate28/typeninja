"use client";

import { useState } from "react";
import { CloseIcon, NinjaStarIcon } from "./Icons";

export function PromoBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-accent/10 border-b border-accent/20 text-accent flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium relative">
      <NinjaStarIcon className="w-4 h-4 shrink-0" />
      <span>Train in silence. Strike with speed.</span>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity text-main"
        aria-label="Close banner"
      >
        <CloseIcon />
      </button>
    </div>
  );
}
