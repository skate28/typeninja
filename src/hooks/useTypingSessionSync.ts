"use client";

import { useCallback, useRef } from "react";
import type { TypingSessionUpdate } from "@/lib/types";

/**
 * Placeholder hook for future Supabase realtime sync.
 * Wire this up once SUPABASE_URL and SUPABASE_ANON_KEY are configured.
 *
 * Example future implementation:
 * - supabase.channel(`typing:${sessionId}`)
 * - .on('broadcast', { event: 'keystroke' }, handler)
 * - .subscribe()
 * - supabase.from('typing_sessions').upsert(...)
 */
export function useTypingSessionSync(sessionId: string | null) {
  const pendingUpdates = useRef<TypingSessionUpdate[]>([]);

  const syncUpdate = useCallback(
    (update: TypingSessionUpdate) => {
      if (!sessionId) return;

      // Queue updates for batching when Supabase is connected
      pendingUpdates.current.push(update);

      // TODO: Connect to Supabase realtime channel
      // const channel = supabase.channel(`typing:${sessionId}`)
      // channel.send({ type: 'broadcast', event: 'keystroke', payload: update })
    },
    [sessionId]
  );

  const flushSession = useCallback(async () => {
    if (!sessionId || pendingUpdates.current.length === 0) return;

    // TODO: Persist final session to Supabase
    // await supabase.from('typing_sessions').upsert({ ... })
    pendingUpdates.current = [];
  }, [sessionId]);

  return { syncUpdate, flushSession };
}
