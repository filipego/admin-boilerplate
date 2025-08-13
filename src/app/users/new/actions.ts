"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function createUser(values: { email: string; username: string; password: string; role?: "admin" | "client" }) {
	const admin = getSupabaseAdminClient();
	const { data: created, error } = await admin.auth.admin.createUser({ email: values.email, password: values.password, email_confirm: true });
	if (error || !created.user) throw new Error(error?.message || "Failed to create user");
	await admin.from("profiles").upsert({ id: created.user.id, email: values.email, username: values.username, role: values.role ?? "client" });
	return { ok: true } as const;
}


