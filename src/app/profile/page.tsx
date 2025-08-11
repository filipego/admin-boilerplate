import AppLayout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileViewEdit from "./ProfileViewEdit";
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");
  // Ensure a row exists and sync role from env-admins if needed
  await supabase.from("profiles").upsert({ id: user.id, email: user.email ?? "" }, { onConflict: "id" });
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (user.email && adminEmails.includes(user.email.toLowerCase())) {
    await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, username, avatar_url, role")
    .eq("id", user.id)
    .single();

  return (
    <AppLayout title="Profile">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {profile ? (
            <ProfileViewEdit profile={profile} />
          ) : (
            <div className="text-sm text-muted-foreground">No profile found.</div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}


