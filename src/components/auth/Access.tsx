"use client";

import { createContext, useContext } from "react";

export type Role = "admin" | "client" | "guest";

const AbilityContext = createContext<{ role: Role }>({ role: "guest" });

export function AbilityProvider({ role, children }: { role: Role; children: React.ReactNode }) {
  return <AbilityContext.Provider value={{ role }}>{children}</AbilityContext.Provider>;
}

export function useAbility() {
  return useContext(AbilityContext);
}

export function Can({ role: required, children }: { role: Role | Role[]; children: React.ReactNode }) {
  const { role } = useAbility();
  const ok = Array.isArray(required) ? required.includes(role) : role === required;
  return ok ? <>{children}</> : null;
}

export function RequireRole({ role: required, children, fallback = null }: { role: Role | Role[]; children: React.ReactNode; fallback?: React.ReactNode }) {
  const { role } = useAbility();
  const ok = Array.isArray(required) ? required.includes(role) : role === required;
  return ok ? <>{children}</> : <>{fallback}</>;
}


