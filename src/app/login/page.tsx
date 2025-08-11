import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./LoginForm";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/dashboard");
  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-2 text-xs">
            <Link href="/dashboard" className="underline">Skip to dashboard</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


