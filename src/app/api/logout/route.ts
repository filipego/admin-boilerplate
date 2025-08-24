import { NextResponse } from "next/server";
import { getSupabaseServerClientWritable } from "@/lib/supabase/server";
import { checkOrigin, rateLimit } from "@/lib/utils";

export async function POST(req: Request) {
  if (!rateLimit(req, 30, 60_000)) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  if (!checkOrigin(req)) return NextResponse.json({ error: "Bad Origin" }, { status: 400 });
  const supabase = getSupabaseServerClientWritable();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}


