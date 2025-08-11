"use server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

  const supabase = getSupabaseServerClient();

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

  return { success: true };
}


