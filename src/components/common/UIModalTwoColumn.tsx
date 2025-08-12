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
      <div className={cn("grid", columnsClassName, gapClassName, size === "fullscreen" ? "h-full" : "max-h-[85vh]")}> 
        <div className={cn("overflow-y-auto", leftClassName)}>{left}</div>
        <div className={cn("overflow-y-auto", rightClassName)}>{right}</div>
      </div>
    </UIModal>
  );
}


