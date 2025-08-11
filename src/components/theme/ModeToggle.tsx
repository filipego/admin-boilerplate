"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ModeToggle = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = (theme ?? resolvedTheme) === "dark";
  const currentIcon = theme === "system" ? (
    <Monitor className="h-5 w-5" aria-hidden />
  ) : isDark ? (
    <Sun className="h-5 w-5" aria-hidden />
  ) : (
    <Moon className="h-5 w-5" aria-hidden />
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme" className="h-8 w-8 md:h-10 md:w-10">
          {currentIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" sideOffset={8} className="min-w-[180px]">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModeToggle;


