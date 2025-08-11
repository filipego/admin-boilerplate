import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action="/dashboard"
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm">Email</label>
              <input id="email" name="email" type="email" className="px-3 py-2 rounded-md border bg-background" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm">Password</label>
              <input id="password" name="password" type="password" className="px-3 py-2 rounded-md border bg-background" />
            </div>
            <Button type="submit" className="w-full">Continue</Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            This is a placeholder login. It redirects to the dashboard.
          </p>
          <div className="mt-2 text-xs">
            <Link href="/dashboard" className="underline">Skip to dashboard</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


