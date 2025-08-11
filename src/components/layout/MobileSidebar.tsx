"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/utils/cn";
import { mainItems, personalItems, bottomItems } from "@/components/layout/sidebar.config";
import SidebarThemeControl from "@/components/sidebar/SidebarThemeControl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type MobileSidebarProps = {
  showProfile: boolean;
  showSidebarTheme: boolean;
  showBottomActions: boolean;
};

const MobileSidebar = ({ showProfile, showSidebarTheme, showBottomActions }: MobileSidebarProps) => {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-3/4 sm:max-w-[320px] p-0">
        <div className="sr-only">
          <SheetTitle>Navigation menu</SheetTitle>
        </div>
        <div className="flex h-dvh flex-col">
          <div className="px-3 py-3 border-b">Studio Admin</div>
          <nav className="px-2 py-2 flex-1 flex flex-col">
            <ul className="space-y-1">
              {mainItems.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                      pathname === href && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {personalItems.length > 0 ? (
              <>
                <div className="mt-4 border-t border-sidebar-border pt-2" />
                <ul className="space-y-1">
                  {personalItems.map(({ href, label, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                        <span>{label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <div className="mt-auto border-t border-sidebar-border pt-2">
              {showProfile ? (
                <div className="flex items-center gap-3 rounded-md px-3 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>ST</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-medium">Sam Taylor</div>
                    <div className="text-xs text-muted-foreground">sam@example.com</div>
                  </div>
                </div>
              ) : null}
              {showSidebarTheme ? (
                <div className="px-2 pt-2">
                  <SidebarThemeControl collapsed={false} />
                </div>
              ) : null}
              {showBottomActions ? (
                <ul className="space-y-1">
                  {bottomItems.map(({ href, label, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                        <span>{label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;


