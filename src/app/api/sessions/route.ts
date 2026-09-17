import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  const { error } = await supabase.from("typing_sessions").insert({
    user_id: user.id,
    mode: "time",
    duration_seconds: body.durationSeconds,
    wpm: body.stats.wpm,
    raw_wpm: body.stats.rawWpm,
    accuracy: body.stats.accuracy,
    correct_chars: body.stats.correctChars,
    incorrect_chars: body.stats.incorrectChars,
    extra_chars: body.stats.extraChars,
    completed_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
