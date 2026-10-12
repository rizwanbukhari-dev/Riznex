export type CompressionLevel = 'recommended' | 'high' | 'light';
export type CompressionMode = 'standard' | 'target';

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  type: string;
  originalSize: number;
  width: number;
  height: number;
  previewUrl: string;
  status: 'pending' | 'compressing' | 'done' | 'error';
  compressedBlob?: Blob;
  compressedUrl?: string;
  compressedSize?: number;
  compressedWidth?: number;
  compressedHeight?: number;
  compressedFormat?: string;
  savingsBytes?: number;
  savingsPercentage?: number;
  errorMessage?: string;
  targetKB?: number;
  targetAchieved?: boolean;
  targetNote?: string;
}

export interface CompressionSettings {
  mode: CompressionMode;
  level: CompressionLevel;
  quality: number; // 0.1 to 1.0
  formatPreference: 'smart' | 'keep' | 'webp';
  targetKB?: number;
  allowDownscale?: boolean;
}
