import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();

    const email = "filipego@gmail.com";
    const password = "123456";
    const username = "Filipe";

    const { data: userCreate, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    });

    if (createError && createError.message.includes("already registered")) {
      return NextResponse.json({ ok: true, note: "User already exists" });
    }
    if (createError) throw createError;

    const userId = userCreate.user?.id;
    if (userId) {
      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        email,
        username,
        role: "admin",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}


