"use client";

import UIButton from "@/components/common/UIButton";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ title = "No data", description = "Try adjusting your filters or add a new item.", actionLabel, onAction, illustration }: { title?: string; description?: string; actionLabel?: string; onAction?: () => void; illustration?: React.ReactNode }) {
  return (
    <div className="text-center py-10">
      {illustration ? <div className="mx-auto mb-3 flex items-center justify-center">{illustration}</div> : null}
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground/80">{description}</div>
      {actionLabel ? (
        <div className="mt-4">
          <UIButton onClick={onAction}>{actionLabel}</UIButton>
        </div>
      ) : null}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description = "Please try again.", onRetry, retryLabel = "Retry" }: { title?: string; description?: string; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className="text-center py-10">
      <div className="text-sm text-destructive">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{description}</div>
      {onRetry ? (
        <div className="mt-4">
          <UIButton variant="outline" onClick={onRetry}>{retryLabel}</UIButton>
        </div>
      ) : null}
    </div>
  );
}


