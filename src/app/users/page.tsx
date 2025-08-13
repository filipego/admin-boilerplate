import AppLayout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UsersTable from "./UsersTable";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import UIButton from "@/components/common/UIButton";
import CreateUserButton from "./CreateUserButton";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import PermissionsMatrixCard from "./PermissionsMatrixCard";
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const supabase = getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const admin = getSupabaseAdminClient();
  // Use cookie if available to avoid repeat DB checks (await per Next dynamic API)
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("role")?.value;
  let effectiveRole = roleCookie || "";
  if (!effectiveRole) {
    const { data: meRowAdmin } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", auth.user.id)
      .maybeSingle();
    effectiveRole = meRowAdmin?.role ?? "client";
  }

  if (effectiveRole !== "admin") redirect("/dashboard");

  const { data: initialUsers } = await admin
    .from("profiles")
    .select("id, email, username, role, avatar_url, created_at")
    .order("created_at", { ascending: false });

  return (
    <AppLayout title="Users">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">All Users</CardTitle>
            <CreateUserButton />
          </div>
        </CardHeader>
        <CardContent>
          <UsersTable initial={(initialUsers ?? []) as any} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Role / Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <PermissionsMatrixCard />
        </CardContent>
      </Card>
    </AppLayout>
  );
}


