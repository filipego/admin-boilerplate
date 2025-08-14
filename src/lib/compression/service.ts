import imageCompression from "browser-image-compression";
import { CompressionOptions, CompressionResult } from "./types";

export class CompressionService {
  static async estimateCompressedSize(file: File, options: CompressionOptions): Promise<number> {
    if (!options.enableCompression) return file.size;
    if (!file.type.toLowerCase().startsWith("image/")) return file.size;
    try {
      const bitmap = await createImageBitmap(file);
      const maxSide = options.imageOptions.maxWidthOrHeight;
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      const areaScale = scale * scale;
      const estimated = Math.max(30_000, Math.round(file.size * areaScale * options.imageOptions.quality));
      return estimated;
    } catch {
      return Math.round(file.size * 0.65);
    }
  }

  static async compressImage(file: File, options: CompressionOptions, onProgress?: (p: number) => void): Promise<CompressionResult> {
    const start = Date.now();
    const imageOptions = options.imageOptions;
    const result = await imageCompression(file, {
      maxSizeMB: imageOptions.maxSizeMB,
      maxWidthOrHeight: imageOptions.maxWidthOrHeight,
      initialQuality: imageOptions.quality,
      useWebWorker: !!imageOptions.useWebWorker,
      onProgress: (p: number) => onProgress?.(p),
    } as any);
    const end = Date.now();
    return {
      success: true,
      compressedFile: result,
      originalSize: file.size,
      compressedSize: result.size,
      compressionRatio: result.size / file.size,
      compressionTime: end - start,
    };
  }

  static async compressIfEnabled(file: File, options: CompressionOptions, onProgress?: (p: number) => void): Promise<CompressionResult | null> {
    if (!options.enableCompression) return null;
    if (!file.type.toLowerCase().startsWith("image/")) return null;
    return this.compressImage(file, options, onProgress);
  }
}


