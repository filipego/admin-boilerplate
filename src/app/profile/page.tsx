import AppLayout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import ProfileViewEdit from "./ProfileViewEdit";
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");
  // Fast path: no writes here to avoid any RLS-induced latency. We only read.

  // Use admin client to guarantee read of own profile (bypass any accidental RLS issues)
  const admin = getSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, username, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

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


