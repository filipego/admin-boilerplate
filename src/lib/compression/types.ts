export interface ImageCompressionOptions {
  maxSizeMB: number; // Target maximum size per image in MB (soft constraint)
  maxWidthOrHeight: number; // Resize longest side to this value (px)
  quality: number; // 0..1 JPEG/WebP quality
  preserveExif: boolean; // Kept for parity; not all browsers preserve EXIF without external libs
  useWebWorker?: boolean; // Whether to enable library-level web worker when available
}

export interface CompressionOptions {
  enableCompression: boolean;
  imageOptions: ImageCompressionOptions;
}

export interface CompressionResult {
  success: boolean;
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // compressedSize / originalSize
  compressionTime: number; // ms
}

export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  enableCompression: true,
  imageOptions: {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    quality: 0.8,
    preserveExif: false,
    useWebWorker: true,
  },
};


