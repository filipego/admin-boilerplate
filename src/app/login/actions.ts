"use server";
import { getSupabaseServerClientWritable } from "@/lib/supabase/server";

export type LoginResult = {
  error?: string;
  success?: boolean;
};

export async function loginAction(_: LoginResult, formData: FormData): Promise<LoginResult> {
  const identifier = String(formData.get("identifier") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!identifier || !password) {
    return { error: "Please enter your email/username and password." };
  }

  // Use writable client so Vercel SSR can set auth cookies correctly
  const supabase = getSupabaseServerClientWritable();

  let email = identifier;
  const looksLikeEmail = identifier.includes("@");

  if (!looksLikeEmail) {
    const { data, error } = await supabase.rpc("get_email_for_username", {
      p_username: identifier,
    });

    if (error) {
      return { error: "Unable to look up username. Please try again." };
    }
    if (!data) {
      return { error: "No account found for that username." };
    }
    email = String(data);
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: signInError.message || "Invalid credentials." };
  }

  // Ensure a profiles row exists for this user and set admin role if configured
  const {
    data: { user: signedInUser },
  } = await supabase.auth.getUser();
  if (signedInUser) {
    await supabase
      .from("profiles")
      .upsert({ id: signedInUser.id, email: signedInUser.email ?? email }, { onConflict: "id" });

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (adminEmails.includes((signedInUser.email ?? email).toLowerCase())) {
      await supabase.from("profiles").update({ role: "admin" }).eq("id", signedInUser.id);
    }
  }

  return { success: true };
}


