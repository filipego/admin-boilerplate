import AppLayout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileViewEdit from "@/app/profile/ProfileViewEdit";
import AdminUserControls from "./AdminUserControls";
export const dynamic = "force-dynamic";

export default async function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const email = (auth.user.email || "").toLowerCase();
  const { data: meRow } = await supabase.from("profiles").select("id, role").eq("id", auth.user.id).maybeSingle();
  if (!meRow) {
    await supabase.from("profiles").upsert({ id: auth.user.id, email: auth.user.email ?? "" }, { onConflict: "id" });
  }
  let effectiveRole = meRow?.role ?? "client";
  if (adminEmails.includes(email) && effectiveRole !== "admin") {
    await supabase.from("profiles").update({ role: "admin" }).eq("id", auth.user.id);
    effectiveRole = "admin";
  }
  if (effectiveRole !== "admin") redirect("/dashboard");

  const { id } = await params;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, username, avatar_url, role")
    .eq("id", id)
    .single();

  return (
    <AppLayout title="Edit User">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">User</CardTitle>
        </CardHeader>
        <CardContent>
          {profile ? (
            <>
              <ProfileViewEdit profile={profile} />
              <AdminUserControls userId={profile.id} />
            </>
          ) : (
            <div className="text-sm text-muted-foreground">User not found.</div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}


