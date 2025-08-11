"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";
import { loginAction, type LoginResult } from "./actions";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Signing in..." : "Continue"}
    </Button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState<LoginResult, FormData>(loginAction, {});
  useEffect(() => {
    if (state?.success) {
      window.location.href = "/dashboard";
    }
  }, [state?.success]);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor="identifier" className="text-sm">
          Email or Username
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          className="px-3 py-2 rounded-md border bg-background"
          aria-invalid={Boolean(state?.error)}
          aria-describedby={state?.error ? "login-error" : undefined}
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="px-3 py-2 rounded-md border bg-background"
        />
      </div>
      {state?.error && (
        <p id="login-error" className="text-sm text-red-500">{state.error}</p>
      )}
      <SubmitButton />
    </form>
  );
}


