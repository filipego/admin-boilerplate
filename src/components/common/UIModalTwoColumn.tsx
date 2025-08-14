"use client";

import UIModal from "@/components/common/UIModal";
import { cn } from "@/lib/utils";

type UIModalTwoColumnProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: "content" | "fullscreen";
  hideTitleVisually?: boolean;
  className?: string;
  columnsClassName?: string; // e.g., "md:grid-cols-[1fr_2fr]"
  gapClassName?: string; // e.g., "gap-6"
  left: React.ReactNode;
  right: React.ReactNode;
  leftClassName?: string;
  rightClassName?: string;
  footer?: React.ReactNode; // right-aligned actions row pinned at bottom
};

export default function UIModalTwoColumn({
  open,
  onOpenChange,
  title,
  description,
  size = "content",
  hideTitleVisually,
  className,
  columnsClassName = "md:grid-cols-2",
  gapClassName = "gap-5",
  left,
  right,
  leftClassName,
  rightClassName,
  footer,
}: UIModalTwoColumnProps) {
  return (
    <UIModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      hideTitleVisually={hideTitleVisually}
      size={size}
      className={className}
      disableScrollWrapper
    >
      <div className={cn(size === "fullscreen" ? "h-full flex flex-col" : "max-h-[85vh] flex flex-col")}> 
        <div className={cn("grid flex-1 min-h-0 overflow-hidden items-start content-start justify-start pt-0 -mt-2", columnsClassName, gapClassName)}> 
          <div className={cn("min-h-0 overflow-y-auto", leftClassName)}>{left}</div>
          <div className={cn("min-h-0 overflow-y-auto", rightClassName)}>{right}</div>
        </div>
        {footer ? (
          <div className="mt-3 flex justify-end gap-2">{footer}</div>
        ) : null}
      </div>
    </UIModal>
  );
}


