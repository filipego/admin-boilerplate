import AppLayout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UIButton from "@/components/common/UIButton";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewUserPage() {
  const supabase = getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", auth.user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  return (
    <AppLayout title="New User">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Coming soon. For now, create users via Supabase Auth and then edit here.</div>
          <div className="mt-4">
            <UIButton asChild uiSize="sm" variant="outline"><Link href="/users">Back</Link></UIButton>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}


