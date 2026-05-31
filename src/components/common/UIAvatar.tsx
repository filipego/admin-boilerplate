"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type UIAvatarProps = {
  src?: string | null;
  alt?: string;
  fallback: string;
  className?: string;
};

export default function UIAvatar({ src, alt = "", fallback, className }: UIAvatarProps) {
  return (
    <Avatar className={cn("h-8 w-8", className)}>
      {src ? <AvatarImage src={src} alt={alt} /> : null}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}
