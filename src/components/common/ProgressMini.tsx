"use client";

import { cn } from "@/lib/utils";

type StepsProps = {
  variant?: "steps";
  current: number; // 1-based current step
  total: number; // total steps >= 1
};

type PercentProps = {
  variant: "percent";
  value: number; // 0..100
};

type BaseProps = {
  className?: string;
  showLabel?: boolean;
  size?: "xs" | "sm"; // height
  rounded?: boolean;
};

type ProgressMiniProps = BaseProps & (StepsProps | PercentProps);

export default function ProgressMini(props: ProgressMiniProps) {
  const { className, showLabel = false, size = "xs", rounded = true } = props;

  const percent = (() => {
    if (props.variant === "percent") {
      return clamp(props.value, 0, 100);
    }
    const safeTotal = Math.max(1, props.total);
    const safeCurrent = clamp(props.current, 0, safeTotal);
    return Math.round((safeCurrent / safeTotal) * 100);
  })();

  const height = size === "xs" ? "h-1.5" : "h-2.5";
  const radius = rounded ? "rounded-full" : "rounded";

  const label = (() => {
    if (!showLabel) return null;
    if (props.variant === "percent") return `${percent}%`;
    return `Step ${clamp(props.current, 1, Math.max(1, props.total))} of ${Math.max(1, props.total)}`;
  })();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-full bg-muted/60", height, radius)} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <div className={cn("bg-primary", height, radius)} style={{ width: `${percent}%` }} />
      </div>
      {showLabel ? (
        <div className="text-xs tabular-nums text-muted-foreground min-w-[2.5rem] text-right">{label}</div>
      ) : null}
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}


