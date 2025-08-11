"use client";

import Link from "next/link";
import MobileSidebar from "@/components/layout/MobileSidebar";
import ModeToggle from "@/components/theme/ModeToggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut } from "lucide-react";

const Header = () => {
  const handleLogout = () => {
    // Placeholder: implement auth later
    // For now, no-op
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-2 md:px-4 py-2 md:py-3 flex items-center">
        <div className="md:hidden mr-1">
          <MobileSidebar showProfile={true} showSidebarTheme={true} showBottomActions={true} />
        </div>
        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifications" className="h-8 w-8 md:h-10 md:w-10">
            <Bell className="h-5 w-5" />
          </Button>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-8 md:h-10">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>ST</AvatarFallback>
                </Avatar>
                <span className="sr-only sm:not-sr-only">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" className="gap-2 h-8 md:h-10 px-2 md:px-3" asChild>
            <Link href="/login">
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;


