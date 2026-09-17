import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase
    .from("typing_sessions")
    .select("id")
    .limit(1);

  if (error) {
    return NextResponse.json({
      ready: false,
      error: error.message,
    });
  }

  return NextResponse.json({ ready: true });
}
