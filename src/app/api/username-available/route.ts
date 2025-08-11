import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = (searchParams.get("username") || "").trim();
  if (!username) return NextResponse.json({ available: false });

  const supabase = getSupabaseServerClient();
  const { data: session } = await supabase.auth.getUser();
  const currentUserId = session.user?.id;

  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .limit(1)
    .maybeSingle();

  const available = !data || data.id === currentUserId;
  return NextResponse.json({ available });
}


