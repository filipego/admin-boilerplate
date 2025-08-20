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
    ? "w-[95vw] h-[95vh] max-h-[100svh] sm:w-[90vw] sm:h-[90vh] md:w-[85vw] md:h-[85vh]"
    : "w-[90vw] max-w-lg max-h-[85vh]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("overflow-hidden flex flex-col min-h-0", sizeClass, className)}>
        <DialogHeader>
          <DialogTitle className={cn(hideTitleVisually && "sr-only")}>{title}</DialogTitle>
          {description ? <DialogDescription className="pb-4">{description}</DialogDescription> : null}
        </DialogHeader>
        {disableScrollWrapper ? (
          children
        ) : (
          <div className={cn("flex-1 min-h-0 overflow-y-auto pt-4")}> 
            {children}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


