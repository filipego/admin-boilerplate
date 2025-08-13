"use client";

import Loader from "@/components/common/Loader";
import { cn } from "@/lib/utils";

export default function LoadingOverlay({ loading, children, label = "Loading...", className }: { loading: boolean; children: React.ReactNode; label?: string; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {loading ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-background/60 backdrop-blur-sm">
          <Loader size="lg" label={label} />
        </div>
      ) : null}
    </div>
  );
}


