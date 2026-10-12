import { ImageItem, CompressionSettings } from '../types';
import JSZip from 'jszip';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type.toLowerCase()) || 
    /\.(jpe?g|png|webp)$/i.test(file.name);
}

/**
 * Loads a File into an ImageItem with dimensions and preview
 */
export function readFileToImageItem(file: File): Promise<ImageItem> {
  return new Promise((resolve, reject) => {
    if (!isValidImageFile(file)) {
      reject(new Error(`"${file.name}" is not a supported image format. Please select JPEG, PNG, or WebP.`));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        type: file.type || 'image/jpeg',
        originalSize: file.size,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        previewUrl,
        status: 'pending',
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      reject(new Error(`Could not load image "${file.name}". File might be corrupted.`));
    };

    img.src = previewUrl;
  });
}

/**
 * Checks whether an image context has any transparent pixels
 */
function hasAlphaChannel(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const imgData = ctx.getImageData(0, 0, Math.min(width, 400), Math.min(height, 400));
    const data = imgData.data;
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] < 250) {
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Helper to generate blob from an image element at specific dimensions & quality
 */
function exportCanvasBlob(
  img: HTMLImageElement,
  width: number,
  height: number,
  mime: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, width);
    canvas.height = Math.max(1, height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve(null);
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (mime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      mime,
      quality
    );
  });
}

/**
 * Target Size (KB) Iterative Compression Algorithm
 * Uses binary search over quality and optional dimension downscaling to reach the requested file size.
 */
async function compressToTargetSize(
  item: ImageItem,
  img: HTMLImageElement,
  settings: CompressionSettings
): Promise<ImageItem> {
  const targetKB = Math.max(5, settings.targetKB || 200);
  const targetBytes = targetKB * 1024;
  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  const isPng = item.type.toLowerCase().includes('png') || item.name.toLowerCase().endsWith('.png');
  const isWebp = item.type.toLowerCase().includes('webp') || item.name.toLowerCase().endsWith('.webp');

  // Determine output format
  let outputMime = 'image/jpeg';
  let extension = 'jpg';

  if (isWebp) {
    outputMime = 'image/webp';
    extension = 'webp';
  } else if (isPng) {
    if (settings.formatPreference === 'keep') {
      outputMime = 'image/png';
      extension = 'png';
    } else {
      // Smart: WebP preserves alpha with variable quality compression
      outputMime = 'image/webp';
      extension = 'webp';
    }
  }

  // Handle strict PNG without format conversion:
  // Since canvas.toBlob('image/png') ignores the quality parameter, the only way to reduce PNG size is dimension scaling.
  if (outputMime === 'image/png') {
    let currentW = originalWidth;
    let currentH = originalHeight;
    let bestBlob = await exportCanvasBlob(img, currentW, currentH, 'image/png', 1.0);

    if (!bestBlob) {
      return { ...item, status: 'error', errorMessage: 'Canvas failed to generate PNG blob.' };
    }

    if (bestBlob.size <= targetBytes) {
      return formatResultItem(item, bestBlob, currentW, currentH, outputMime, extension, targetKB, true, `Target achieved: ${formatBytes(bestBlob.size)}`);
    }

    if (!settings.allowDownscale) {
      return formatResultItem(
        item, 
        bestBlob, 
        currentW, 
        currentH, 
        outputMime, 
        extension, 
        targetKB, 
        false, 
        `PNG is a lossless format (${formatBytes(bestBlob.size)}). Convert to WebP or enable auto-downscale to achieve ${targetKB} KB.`
      );
    }

    // Iteratively scale dimensions down to reach target
    for (let i = 0; i < 5; i++) {
      const scale = Math.sqrt(targetBytes / bestBlob.size) * 0.95;
      if (scale >= 0.98) break;
      currentW = Math.max(32, Math.round(currentW * Math.max(0.2, scale)));
      currentH = Math.max(32, Math.round(currentH * Math.max(0.2, scale)));
      const nextBlob = await exportCanvasBlob(img, currentW, currentH, 'image/png', 1.0);
      if (nextBlob) {
        bestBlob = nextBlob;
        if (bestBlob.size <= targetBytes) break;
      }
    }

    const achieved = bestBlob.size <= targetBytes;
    const note = achieved 
      ? `Target achieved with dimension scaling to ${currentW}×${currentH} px.`
      : `Closest achievable PNG size is ${formatBytes(bestBlob.size)} (Target: ${targetKB} KB).`;

    return formatResultItem(item, bestBlob, currentW, currentH, outputMime, extension, targetKB, achieved, note);
  }

  // Standard Lossy (JPEG / WebP) Binary Search Quality Algorithm
  let curW = originalWidth;
  let curH = originalHeight;

  let bestBlob: Blob | null = null;
  let bestUnderTargetBlob: Blob | null = null;
  let smallestBlobSoFar: Blob | null = null;

  // Pass 1: Binary search at full resolution
  let minQ = 0.05;
  let maxQ = 0.98;

  for (let step = 0; step < 7; step++) {
    const q = (minQ + maxQ) / 2;
    const blob = await exportCanvasBlob(img, curW, curH, outputMime, q);
    if (!blob) continue;

    if (!smallestBlobSoFar || blob.size < smallestBlobSoFar.size) {
      smallestBlobSoFar = blob;
    }

    if (blob.size <= targetBytes) {
      bestUnderTargetBlob = blob;
      minQ = q; // try for higher quality
    } else {
      maxQ = q; // too big, decrease quality
    }
  }

  if (bestUnderTargetBlob) {
    bestBlob = bestUnderTargetBlob;
    return formatResultItem(
      item, 
      bestBlob, 
      curW, 
      curH, 
      outputMime, 
      extension, 
      targetKB, 
      true, 
      `Target achieved at full resolution: ${formatBytes(bestBlob.size)}`
    );
  }

  // Pass 2: If even lowest quality at full resolution is bigger than target, downscale dimensions if allowed
  if (settings.allowDownscale && smallestBlobSoFar) {
    const scaleFactor = Math.min(0.85, Math.max(0.2, Math.sqrt(targetBytes / smallestBlobSoFar.size) * 0.95));
    curW = Math.max(64, Math.round(originalWidth * scaleFactor));
    curH = Math.max(64, Math.round(originalHeight * scaleFactor));

    minQ = 0.15;
    maxQ = 0.95;

    for (let step = 0; step < 6; step++) {
      const q = (minQ + maxQ) / 2;
      const blob = await exportCanvasBlob(img, curW, curH, outputMime, q);
      if (!blob) continue;

      if (!smallestBlobSoFar || blob.size < smallestBlobSoFar.size) {
        smallestBlobSoFar = blob;
      }

      if (blob.size <= targetBytes) {
        bestUnderTargetBlob = blob;
        minQ = q;
      } else {
        maxQ = q;
      }
    }

    if (bestUnderTargetBlob) {
      bestBlob = bestUnderTargetBlob;
      return formatResultItem(
        item, 
        bestBlob, 
        curW, 
        curH, 
        outputMime, 
        extension, 
        targetKB, 
        true, 
        `Target achieved with auto-scaling to ${curW}×${curH} px`
      );
    }
  }

  // Fallback if target was completely unreachable (e.g. asking for 5 KB on 4K image)
  bestBlob = bestUnderTargetBlob || smallestBlobSoFar;
  if (!bestBlob) {
    return { ...item, status: 'error', errorMessage: 'Could not generate target compression.' };
  }

  const achieved = bestBlob.size <= targetBytes;
  const note = achieved 
    ? `Target achieved: ${formatBytes(bestBlob.size)}`
    : `Target of ${targetKB} KB was unreachable. Closest result: ${formatBytes(bestBlob.size)} (${curW}×${curH} px).`;

  return formatResultItem(item, bestBlob, curW, curH, outputMime, extension, targetKB, achieved, note);
}

function formatResultItem(
  item: ImageItem,
  blob: Blob,
  width: number,
  height: number,
  mime: string,
  extension: string,
  targetKB: number,
  targetAchieved: boolean,
  targetNote: string
): ImageItem {
  const compressedSize = blob.size;
  const savingsBytes = item.originalSize - compressedSize;
  const savingsPercentage = Math.round((savingsBytes / item.originalSize) * 100);
  const compressedUrl = URL.createObjectURL(blob);

  const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
  const outputName = `${baseName}_${Math.round(compressedSize / 1024)}kb.${extension}`;

  return {
    ...item,
    status: 'done',
    name: outputName,
    compressedBlob: blob,
    compressedUrl,
    compressedSize,
    compressedWidth: width,
    compressedHeight: height,
    compressedFormat: mime,
    savingsBytes,
    savingsPercentage,
    targetKB,
    targetAchieved,
    targetNote,
  };
}

/**
 * Compresses an individual ImageItem with optimal client-side algorithms
 */
export function compressSingleImage(
  item: ImageItem,
  settings: CompressionSettings
): Promise<ImageItem> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = async () => {
      // If Target Size (KB) mode is selected:
      if (settings.mode === 'target') {
        try {
          const targetResult = await compressToTargetSize(item, img, settings);
          resolve(targetResult);
        } catch (err: any) {
          resolve({
            ...item,
            status: 'error',
            errorMessage: err.message || 'Target size compression failed.',
          });
        }
        return;
      }

      // Standard Compression Mode
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        resolve({
          ...item,
          status: 'error',
          errorMessage: 'Could not create canvas rendering context.',
        });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const isPng = item.type.toLowerCase().includes('png') || item.name.toLowerCase().endsWith('.png');
      const isWebp = item.type.toLowerCase().includes('webp') || item.name.toLowerCase().endsWith('.webp');

      let quality = settings.quality;
      if (settings.level === 'recommended') quality = 0.78;
      else if (settings.level === 'high') quality = 0.58;
      else if (settings.level === 'light') quality = 0.88;

      ctx.drawImage(img, 0, 0, width, height);

      let outputMime = 'image/jpeg';
      let extension = 'jpg';

      if (isWebp) {
        outputMime = 'image/webp';
        extension = 'webp';
      } else if (isPng) {
        const hasAlpha = hasAlphaChannel(ctx, width, height);
        if (settings.formatPreference === 'keep') {
          outputMime = 'image/png';
          extension = 'png';
        } else if (hasAlpha) {
          outputMime = 'image/webp';
          extension = 'webp';
        } else {
          outputMime = 'image/webp';
          extension = 'webp';
        }
      } else {
        outputMime = 'image/jpeg';
        extension = 'jpg';
      }

      if (outputMime === 'image/jpeg') {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = width;
        bgCanvas.height = height;
        const bgCtx = bgCanvas.getContext('2d');
        if (bgCtx) {
          bgCtx.fillStyle = '#ffffff';
          bgCtx.fillRect(0, 0, width, height);
          bgCtx.drawImage(canvas, 0, 0);
          canvas.width = 1;
          canvas.height = 1;
          renderStandardBlob(bgCanvas, outputMime, quality, item, width, height, extension, resolve);
          return;
        }
      }

      renderStandardBlob(canvas, outputMime, quality, item, width, height, extension, resolve);
    };

    img.onerror = () => {
      resolve({
        ...item,
        status: 'error',
        errorMessage: 'Failed to decode image data.',
      });
    };

    img.src = item.previewUrl;
  });
}

function renderStandardBlob(
  canvas: HTMLCanvasElement,
  outputMime: string,
  quality: number,
  item: ImageItem,
  width: number,
  height: number,
  extension: string,
  resolve: (value: ImageItem) => void
) {
  canvas.toBlob(
    (blob) => {
      if (!blob) {
        resolve({
          ...item,
          status: 'error',
          errorMessage: 'Canvas failed to generate compressed file blob.',
        });
        return;
      }

      const compressedSize = blob.size;
      const savingsBytes = item.originalSize - compressedSize;
      const savingsPercentage = Math.round((savingsBytes / item.originalSize) * 100);
      const compressedUrl = URL.createObjectURL(blob);

      const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
      const outputName = `${baseName}_compressed.${extension}`;

      resolve({
        ...item,
        status: 'done',
        name: outputName,
        compressedBlob: blob,
        compressedUrl,
        compressedSize,
        compressedWidth: width,
        compressedHeight: height,
        compressedFormat: outputMime,
        savingsBytes,
        savingsPercentage,
      });
    },
    outputMime,
    quality
  );
}

/**
 * Packages multiple compressed image items into a downloadable ZIP file
 */
export async function downloadAllAsZip(images: ImageItem[]): Promise<void> {
  const completed = images.filter((img) => img.status === 'done' && img.compressedBlob);
  if (completed.length === 0) return;

  if (completed.length === 1) {
    downloadSingleImage(completed[0]);
    return;
  }

  const zip = new JSZip();
  const folder = zip.folder('riznex_compressed') || zip;

  for (let i = 0; i < completed.length; i++) {
    const item = completed[i];
    if (item.compressedBlob) {
      folder.file(item.name, item.compressedBlob);
    }
  }

  const zipContent = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(zipContent);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `riznex_compressed_images_${completed.length}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 4000);
}

/**
 * Downloads a single image
 */
export function downloadSingleImage(item: ImageItem): void {
  if (!item.compressedUrl) return;
  const link = document.createElement('a');
  link.href = item.compressedUrl;
  link.download = item.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
