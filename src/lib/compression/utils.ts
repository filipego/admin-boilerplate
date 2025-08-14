export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"] as const;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function detectWorkerSupport() {
  const cores = typeof navigator !== "undefined" && (navigator as any).hardwareConcurrency ? (navigator as any).hardwareConcurrency : 1;
  const hasOffscreen = typeof (globalThis as any).OffscreenCanvas !== "undefined";
  const hasWorker = typeof Worker !== "undefined";
  return {
    cores,
    hasOffscreen,
    hasWorker,
    summary: `${cores} cores${hasOffscreen ? " • Canvas" : ""}`,
  };
}


