"use client";

import { useMemo } from "react";
import UIButton from "@/components/common/UIButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompressionOptions } from "@/lib/compression/types";
import { detectWorkerSupport } from "@/lib/compression/utils";

export default function CompressionSettings({
  enabled,
  onToggle,
  options,
  onOptionsChange,
  summary,
  isCalculating = false,
  filesTotal = 0,
  filesCompressing = 0,
}: {
  enabled: boolean;
  onToggle: (e: boolean) => void;
  options: CompressionOptions;
  onOptionsChange: (o: CompressionOptions) => void;
  summary?: { totalOriginal: number; totalEstimated: number; savings: number; savingsPercent: number };
  isCalculating?: boolean;
  filesTotal?: number;
  filesCompressing?: number;
}) {
  const support = useMemo(() => detectWorkerSupport(), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Global Compression Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary && (
          <div className="rounded-md border p-3 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium">Size Summary</div>
              <div className="text-[11px] text-muted-foreground">{filesCompressing} of {filesTotal} files</div>
            </div>
            {isCalculating ? (
              <div className="text-xs text-muted-foreground">Calculating size estimates…</div>
            ) : (
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Original size:</span>
                  <span>{formatBytes(summary.totalOriginal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estimated size after compression:</span>
                  <span>{formatBytes(summary.totalEstimated)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total savings:</span>
                  <span className="text-emerald-600">{formatBytes(summary.savings)} ({Math.max(0, summary.savingsPercent)}% smaller)</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="text-sm">Enable Compression</div>
          <button
            type="button"
            className="px-3 py-1 rounded-md border text-sm"
            onClick={() => onToggle(!enabled)}
            aria-pressed={enabled}
          >
            {enabled ? "On" : "Off"}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm">Max Size</div>
            <div className="text-xs text-muted-foreground">{options.imageOptions.maxSizeMB}MB</div>
          </div>
          <input
            type="range"
            min={0.1}
            max={10}
            step={0.1}
            value={options.imageOptions.maxSizeMB}
            onChange={(e) => onOptionsChange({
              ...options,
              imageOptions: { ...options.imageOptions, maxSizeMB: Number(e.target.value) },
            })}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm">Quality</div>
            <div className="text-xs text-muted-foreground">{Math.round(options.imageOptions.quality * 100)}%</div>
          </div>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.01}
            value={options.imageOptions.quality}
            onChange={(e) => onOptionsChange({
              ...options,
              imageOptions: { ...options.imageOptions, quality: Number(e.target.value) },
            })}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm">Max Resolution</div>
            <div className="text-xs text-muted-foreground">{options.imageOptions.maxWidthOrHeight}px</div>
          </div>
          <input
            type="range"
            min={480}
            max={4096}
            step={10}
            value={options.imageOptions.maxWidthOrHeight}
            onChange={(e) => onOptionsChange({
              ...options,
              imageOptions: { ...options.imageOptions, maxWidthOrHeight: Number(e.target.value) },
            })}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">Preserve EXIF</div>
          <button
            type="button"
            className="px-3 py-1 rounded-md border text-sm"
            onClick={() => onOptionsChange({
              ...options,
              imageOptions: { ...options.imageOptions, preserveExif: !options.imageOptions.preserveExif },
            })}
            aria-pressed={options.imageOptions.preserveExif}
          >
            {options.imageOptions.preserveExif ? "On" : "Off"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">Use Web Workers</div>
          <button
            type="button"
            className="px-3 py-1 rounded-md border text-sm"
            onClick={() => onOptionsChange({
              ...options,
              imageOptions: { ...options.imageOptions, useWebWorker: !options.imageOptions.useWebWorker },
            })}
            aria-pressed={!!options.imageOptions.useWebWorker}
          >
            {options.imageOptions.useWebWorker ? "On" : "Off"}
          </button>
        </div>

        <div className="rounded-md border p-2 text-xs text-emerald-700 bg-emerald-50">
          Workers available ({support.cores} cores){support.hasOffscreen ? " • Canvas" : ""}
        </div>
      </CardContent>
    </Card>
  );
}

function formatBytes(bytes: number) {
  if (!bytes || bytes < 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"] as const;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}


