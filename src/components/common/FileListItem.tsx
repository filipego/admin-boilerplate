"use client";

import UIButton from "@/components/common/UIButton";
import { Card, CardContent } from "@/components/ui/card";
import { CompressionResult } from "@/lib/compression/types";
import { formatFileSize } from "@/lib/compression/utils";

export default function FileListItem({
  file,
  title,
  description,
  progress,
  preview,
  compressionEnabled,
  compressionProgress,
  isCompressing,
  estimatedCompressedSize,
  compressionResult,
  onRemove,
  onUpdateTitle,
  onUpdateDescription,
  onToggleCompression,
  showTitleDescription,
}: {
  file: File;
  title?: string;
  description?: string;
  progress: number;
  preview?: string;
  compressionEnabled: boolean;
  compressionProgress: number;
  isCompressing: boolean;
  estimatedCompressedSize?: number;
  compressionResult?: CompressionResult;
  onRemove: () => void;
  onUpdateTitle?: (t: string) => void;
  onUpdateDescription?: (d: string) => void;
  onToggleCompression: (enabled: boolean) => void;
  showTitleDescription?: boolean;
}) {
  const savingsBlock = (() => {
    if (compressionResult?.success) {
      const saved = file.size - compressionResult.compressedSize;
      const savedPct = Math.max(0, 1 - compressionResult.compressedSize / file.size);
      return `Final: ${formatFileSize(compressionResult.compressedSize)} (from ${formatFileSize(file.size)}, −${Math.round(savedPct * 100)}%)`;
    }
    if (compressionEnabled && estimatedCompressedSize) {
      const savedPct = Math.max(0, 1 - estimatedCompressedSize / file.size);
      return `Est: ${formatFileSize(estimatedCompressedSize)} (from ${formatFileSize(file.size)}, −${Math.round(savedPct * 100)}%)`;
    }
    return `Original: ${formatFileSize(file.size)}`;
  })();

  return (
    <Card>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-3">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={file.name} className="w-16 h-16 object-cover rounded" />
          ) : (
            <div className="w-16 h-16 grid place-items-center text-xs text-muted-foreground bg-muted rounded">{file.type || "file"}</div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm truncate" title={file.name}>{file.name}</div>
            <div className="text-[11px] text-muted-foreground">{savingsBlock}</div>
          </div>
          <div className="shrink-0">
            <UIButton uiSize="sm" variant="outline" onClick={() => onToggleCompression(!compressionEnabled)}>
              {compressionEnabled ? "Disable Compression" : "Enable Compression"}
            </UIButton>
          </div>
          <div className="shrink-0">
            <UIButton uiSize="sm" variant="outline" onClick={onRemove}>Remove</UIButton>
          </div>
        </div>
        <div className="h-1 rounded bg-muted overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
        {isCompressing ? (
          <div className="text-[11px] text-muted-foreground">Compressing... {compressionProgress}%</div>
        ) : null}
        {showTitleDescription ? (
          <div className="grid gap-2">
            <input
              className="px-3 py-2 rounded-md border bg-background"
              placeholder="Title"
              value={title || ""}
              onChange={(e) => onUpdateTitle?.(e.target.value)}
            />
            <textarea
              className="px-3 py-2 rounded-md border bg-background"
              placeholder="Description"
              rows={2}
              value={description || ""}
              onChange={(e) => onUpdateDescription?.(e.target.value)}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

