"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import UIModalTwoColumn from "@/components/common/UIModalTwoColumn";
import UIButton from "@/components/common/UIButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showError, showSaved } from "@/lib/toast";
import { useCompressionSettings } from "@/lib/hooks/useCompressionSettings";
import CompressionSettings from "@/components/common/CompressionSettings";
import FileListItem from "@/components/common/FileListItem";
import { CompressionService } from "@/lib/compression/service";
import { DEFAULT_COMPRESSION_OPTIONS, type CompressionOptions } from "@/lib/compression/types";

type UploadingFile = {
  id: string;
  file: File;
  progress: number;
  isCompressing: boolean;
  compressionProgress: number;
  compressedFile?: File;
  preview?: string;
  compressionEnabled: boolean;
  estimatedCompressedSize?: number;
  title: string;
  description: string;
};

type AdvancedFileUploaderProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  folder?: string; // R2 folder prefix
  accept?: string;
  maxFiles?: number;
  enableCompressionDefault?: boolean;
  onUploadComplete?: (files: Array<{ url: string; title: string; description: string; originalName: string; size: number; mimeType: string }>) => void;
};

export default function AdvancedFileUploader({
  open,
  onOpenChange,
  title = "Upload Files",
  description,
  folder = "uploads",
  accept = "image/*,application/pdf",
  maxFiles = 10,
  enableCompressionDefault = true,
  onUploadComplete,
}: AdvancedFileUploaderProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const { enabled: globalEnabled, options, toggleEnabled, updateOptions } = useCompressionSettings();
  // Initialize from props on first open
  const compressionEnabled = globalEnabled;
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFiles = () => inputRef.current?.click();

  const revokePreviews = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
      return prev;
    });
  }, []);

  const estimateCompressedSize = async (file: File): Promise<number> => CompressionService.estimateCompressedSize(file, options);

  const handleAddFiles = useCallback((selected: FileList | null) => {
    if (!selected) return;
    const list = Array.from(selected);
    const next = list.slice(0, Math.max(0, maxFiles - files.length)).map((file) => ({
      id: Math.random().toString(36).slice(2, 9),
      file,
      progress: 0,
      isCompressing: false,
      compressionProgress: 0,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      compressionEnabled,
      title: file.name.replace(/\.[^/.]+$/, ""), // Use filename without extension as default title
      description: "",
    }));
    setFiles((prev) => [...prev, ...next]);
    // compute estimates async
    next.forEach(async (nf) => {
      const est = await estimateCompressedSize(nf.file);
      setFiles((prev) => prev.map((f) => (f.id === nf.id ? { ...f, estimatedCompressedSize: est } : f)));
    });
  }, [files.length, maxFiles]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddFiles(e.dataTransfer.files);
  }, [handleAddFiles]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const compressImageIfNeeded = useCallback(async (file: File, onProgress?: (p: number) => void) => {
    const res = await CompressionService.compressIfEnabled(file, { ...options, enableCompression: true }, onProgress);
    return res?.compressedFile ?? file;
  }, [options]);

  const onToggleCompression = useCallback((enabled: boolean) => {
    setFiles((prev) => prev.map((f) => ({ ...f, compressionEnabled: enabled })));
  }, []);

  const onUpdateTitle = useCallback((fileId: string, title: string) => {
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, title } : f));
  }, []);

  const onUpdateDescription = useCallback((fileId: string, description: string) => {
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, description } : f));
  }, []);

  // Compression size summary (estimates)
  const compressionSummary = useMemo(() => {
    const totalOriginal = files.reduce((sum, f) => sum + f.file.size, 0);
    const totalEstimated = files.reduce((sum, f) => sum + (f.compressionEnabled ? (f.estimatedCompressedSize ?? f.file.size) : f.file.size), 0);
    const savings = Math.max(0, totalOriginal - totalEstimated);
    const savingsPercent = totalOriginal > 0 ? Math.round((savings / totalOriginal) * 100) : 0;
    return { totalOriginal, totalEstimated, savings, savingsPercent };
  }, [files]);

  const uploadAll = useCallback(async () => {
    if (files.length === 0) return;
    setBusy(true);
    const uploadedFiles: Array<{ url: string; title: string; description: string; originalName: string; size: number; mimeType: string }> = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        let toSend = item.file;
        if (item.compressionEnabled && item.file.type.startsWith("image/")) {
          setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, isCompressing: true, compressionProgress: 0 } : f));
          toSend = await compressImageIfNeeded(item.file, (p) => {
            setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, compressionProgress: Math.round(p) } : f));
          });
          setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, isCompressing: false, compressedFile: toSend } : f));
        }

        const form = new FormData();
        form.append("file", toSend);
        form.append("folder", folder);
        // Add title and description metadata
        form.append("title", item.title);
        form.append("description", item.description);
        // Provide compression metadata for parity
        if (item.compressedFile) {
          form.append("originalFileSize", String(item.file.size));
          form.append("compressionRatio", String((item.compressedFile.size / item.file.size).toFixed(4)));
          form.append("compressionEnabled", "true");
        } else {
          form.append("originalFileSize", String(item.file.size));
          form.append("compressionRatio", "1.0");
          form.append("compressionEnabled", String(item.compressionEnabled));
        }

        const json = await new Promise<{ url?: string }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/upload-file");
          xhr.upload.onprogress = (evt) => {
            if (!evt.lengthComputable) return;
            const pct = Math.round((evt.loaded / evt.total) * 100);
            setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, progress: pct } : f));
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try { resolve(JSON.parse(xhr.responseText)); } catch (e) { resolve({}); }
            } else {
              reject(new Error(xhr.responseText || `HTTP ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(form);
        });

        if (json?.url) {
          uploadedFiles.push({
            url: json.url,
            title: item.title,
            description: item.description,
            originalName: item.file.name,
            size: item.file.size,
            mimeType: item.file.type,
          });
        }
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, progress: 100 } : f));
      }
      onUploadComplete?.(uploadedFiles);
      showSaved("Uploaded");
      // Reset state after success
      revokePreviews();
      setFiles([]);
      onOpenChange(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      showError(msg);
    } finally {
      setBusy(false);
    }
  }, [files, folder, onOpenChange, onUploadComplete, revokePreviews, compressionEnabled, compressImageIfNeeded]);

  const left = (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={(e) => handleAddFiles(e.target.files)} />
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") pickFiles(); }}
            onClick={pickFiles}
            onDrop={onDrop}
            onDragOver={onDragOver}
            aria-label="File dropzone"
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors text-sm text-muted-foreground hover:border-primary/50"
          >
            Drag & drop files here, or click to select files
            <div className="mt-2 text-xs text-muted-foreground">Support for images (max 100MB each)</div>
          </div>
          {files.length > 0 && (
            <div className="space-y-2 max-h-[48vh] overflow-y-auto pr-1">
              {files.map((f, idx) => (
                <FileListItem
                  key={f.id}
                  file={f.file}
                  title={f.title}
                  description={f.description}
                  progress={f.progress}
                  preview={f.preview}
                  compressionEnabled={f.compressionEnabled}
                  compressionProgress={f.compressionProgress}
                  isCompressing={f.isCompressing}
                  estimatedCompressedSize={f.estimatedCompressedSize}
                  compressionResult={undefined}
                  onRemove={() => { if (f.preview) URL.revokeObjectURL(f.preview); setFiles((prev) => prev.filter((x) => x.id !== f.id)); }}
                  onToggleCompression={(en) => setFiles((prev) => prev.map((x, i) => i === idx ? { ...x, compressionEnabled: en } : x))}
                  showTitleDescription={true}
                  onUpdateTitle={(title) => onUpdateTitle(f.id, title)}
                  onUpdateDescription={(description) => onUpdateDescription(f.id, description)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const right = (
    <div className="space-y-3">
      <CompressionSettings
        enabled={compressionEnabled}
        onToggle={(e) => toggleEnabled(e)}
        options={options}
        onOptionsChange={(o) => updateOptions(o)}
        summary={compressionSummary}
        filesTotal={files.length}
        filesCompressing={files.filter((f) => f.compressionEnabled).length}
      />
    </div>
  );

  return (
    <UIModalTwoColumn
      open={open}
      onOpenChange={(o) => { if (!o) revokePreviews(); onOpenChange(o); }}
      title={`Upload Files (${files.length})`}
      description={description}
      size="fullscreen"
      className="gap-0"
      left={left}
      right={right}
      columnsClassName="md:grid-cols-2 items-start content-start justify-start"
      leftClassName="self-start flex flex-col min-h-0"
      rightClassName="self-start flex flex-col min-h-0"
      footer={
        <>
          <UIButton variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</UIButton>
          <UIButton onClick={uploadAll} disabled={busy || files.length === 0}>{busy ? "Uploading..." : `Upload ${files.length} file${files.length === 1 ? "" : "s"}`}</UIButton>
        </>
      }
    />
  );
}


