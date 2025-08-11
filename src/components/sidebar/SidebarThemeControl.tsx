"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Sun, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils/cn";

type SidebarThemeControlProps = { collapsed: boolean };

const SidebarThemeControl = ({ collapsed }: SidebarThemeControlProps) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = (theme ?? resolvedTheme) === "dark";
  const icon = theme === "system" ? (
    <Monitor className="h-4 w-4" aria-hidden />
  ) : isDark ? (
    <Sun className="h-4 w-4" aria-hidden />
  ) : (
    <Moon className="h-4 w-4" aria-hidden />
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full text-left rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
            "flex items-center",
            collapsed ? "justify-center" : "justify-between"
          )}
          aria-label="Theme"
        >
          <span className={cn(collapsed && "sr-only")}>Theme</span>
          {icon}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={collapsed ? "center" : "end"} sideOffset={8} className="min-w-[180px]">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SidebarThemeControl;


