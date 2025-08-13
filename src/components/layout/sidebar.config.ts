import { Home, Users, Briefcase, User, BarChart3 } from "lucide-react";

export type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

export const mainItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/examples", label: "Examples", icon: Briefcase },
  { href: "/users", label: "Users", icon: Users },
  { href: "/reports", label: "Reports / Analytics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

export const personalItems: NavItem[] = [];

export const bottomItems: NavItem[] = [];


