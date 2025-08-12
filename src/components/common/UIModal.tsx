"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type UIModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: "content" | "fullscreen";
  title: string;
  description?: string;
  hideTitleVisually?: boolean;
  children: React.ReactNode;
  className?: string;
  disableScrollWrapper?: boolean;
};

export default function UIModal({ open, onOpenChange, size = "content", title, description, hideTitleVisually, children, className, disableScrollWrapper }: UIModalProps) {
  const sizeClass = size === "fullscreen"
    ? "w-[95vw] h-[95vh] sm:w-[90vw] sm:h-[90vh] md:w-[85vw] md:h-[85vh]"
    : "w-[90vw] max-w-lg";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(sizeClass, className)}>
        <DialogHeader>
          <DialogTitle className={cn(hideTitleVisually && "sr-only")}>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {disableScrollWrapper ? (
          children
        ) : (
          <div className={cn(size === "fullscreen" ? "h-full overflow-y-auto" : "max-h-[85vh] overflow-y-auto")}>
            {children}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


