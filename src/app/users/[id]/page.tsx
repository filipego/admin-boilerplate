import AppLayout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
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
  const admin = getSupabaseAdminClient();
  const { data: meRowAdmin } = await admin.from("profiles").select("id, role").eq("id", auth.user.id).maybeSingle();
  if (!meRowAdmin) {
    await admin.from("profiles").upsert({ id: auth.user.id, email: auth.user.email ?? "" }, { onConflict: "id" });
  }
  let effectiveRole = meRowAdmin?.role ?? "client";
  if (adminEmails.includes(email) && effectiveRole !== "admin") {
    await admin.from("profiles").update({ role: "admin" }).eq("id", auth.user.id);
    effectiveRole = "admin";
  }
  if (effectiveRole !== "admin") redirect("/dashboard");

  const { id } = await params;
  const { data: profile } = await admin
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
              <div className="mb-4 grid gap-2">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" /> : null}
                  <div>
                    <div className="font-medium">{profile.username ?? "—"}</div>
                    <div className="text-sm text-muted-foreground">{profile.email}</div>
                    <div className="text-xs">Role: {profile.role}</div>
                  </div>
                </div>
              </div>
              <AdminUserControls
                userId={profile.id}
                initialUsername={profile.username ?? ""}
                initialAvatarUrl={profile.avatar_url}
                initialRole={(profile.role === "admin" ? "admin" : "client")}
              />
            </>
          ) : (
            <div className="text-sm text-muted-foreground">User not found.</div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}


