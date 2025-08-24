import { NextResponse } from "next/server";
import { getSupabaseServerClientWritable } from "@/lib/supabase/server";
import { checkOrigin, rateLimit } from "@/lib/utils";

export async function POST(req: Request) {
  if (!rateLimit(req, 10, 60_000)) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  if (!checkOrigin(req)) return NextResponse.json({ error: "Bad Origin" }, { status: 400 });
  try {
    const { password } = (await req.json()) as { password?: string };
    if (!password || password.length < 6) return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    const supabase = getSupabaseServerClientWritable();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}


