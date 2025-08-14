"use client";

import { useEffect, useState } from "react";
import { CompressionOptions, DEFAULT_COMPRESSION_OPTIONS } from "@/lib/compression/types";

const STORAGE_KEY = "compression-settings";

export function useCompressionSettings() {
  const [enabled, setEnabled] = useState<boolean>(DEFAULT_COMPRESSION_OPTIONS.enableCompression);
  const [options, setOptions] = useState<CompressionOptions>(DEFAULT_COMPRESSION_OPTIONS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CompressionOptions;
        setEnabled(parsed.enableCompression);
        setOptions(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...options, enableCompression: enabled }));
    } catch {}
  }, [enabled, options]);

  return {
    enabled,
    options,
    toggleEnabled: (e: boolean) => setEnabled(e),
    updateOptions: (o: CompressionOptions) => setOptions(o),
  } as const;
}


