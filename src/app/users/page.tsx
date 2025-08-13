import AppLayout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UsersTable from "./UsersTable";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import UIButton from "@/components/common/UIButton";
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const supabase = getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // Ensure profile row exists and role is synced from env-admins
  const email = (auth.user.email || "").toLowerCase();
  const { data: meRow } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (!meRow) {
    await supabase.from("profiles").upsert({ id: auth.user.id, email: auth.user.email ?? "" }, { onConflict: "id" });
  }

  let effectiveRole = meRow?.role ?? "client";
  if (adminEmails.includes(email) && effectiveRole !== "admin") {
    await supabase.from("profiles").update({ role: "admin" }).eq("id", auth.user.id);
    effectiveRole = "admin";
  }

  if (effectiveRole !== "admin") redirect("/dashboard");

  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, username, role, avatar_url")
    .order("created_at", { ascending: false });
  void users; // avoid unused vars warning, data is consumed by UsersTable via realtime

  return (
    <AppLayout title="Users">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Users</CardTitle>
            <UIButton asChild uiSize="sm">
              <Link href="/users/new">New User</Link>
            </UIButton>
          </div>
        </CardHeader>
        <CardContent>
          <UsersTable />
        </CardContent>
      </Card>
    </AppLayout>
  );
}


