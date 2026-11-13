/**
 * Cloudinary Image Upload, Transparency Verification & Optimization Service
 *
 * Supports:
 * - PNG (with verified RGBA alpha transparency), JPG, JPEG, WebP
 * - Pixel-level alpha channel inspection (`analyzeImagePixels` & `inspectImageTransparency`)
 *   to distinguish genuine transparent PNG cutouts from fake PNGs that have a grey-and-white
 *   checkerboard or opaque background baked into their RGB pixels
 * - Strict MIME-type and file-size (10MB) validation
 * - Explicit `f_png,q_auto,w_500,h_620,c_limit` Cloudinary delivery transformation so
 *   transparent player cutouts are always delivered as true 32-bit RGBA PNGs
 * - Transparent-safe client-side canvas optimization when Cloudinary env vars are not configured
 */

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = /\.(png|jpe?g|webp)$/i;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const getEnv = (key) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch {
    // ignore in non-Vite environments
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

// Session deduplication cache: prevents uploading the exact same file twice
const uploadCache = new Map();

export const cloudinaryService = {
  getConfig() {
    const cloudName = getEnv('VITE_CLOUDINARY_CLOUD_NAME').trim();
    const uploadPreset = getEnv('VITE_CLOUDINARY_UPLOAD_PRESET').trim();
    return { cloudName, uploadPreset };
  },

  isConfigured() {
    const { cloudName, uploadPreset } = this.getConfig();
    return Boolean(
      cloudName &&
        uploadPreset &&
        !cloudName.includes('your-') &&
        !uploadPreset.includes('your-')
    );
  },

  /**
   * Validates an image file before upload.
   * Ensures format is PNG, JPG, JPEG, or WebP and size is <= 10MB.
   */
  validateImageFile(file) {
    if (!file) {
      throw new Error('Please select an image file.');
    }

    const mimeValid = file.type && ALLOWED_MIME_TYPES.has(file.type.toLowerCase());
    const extValid = file.name && ALLOWED_EXTENSIONS.test(file.name);

    if (!mimeValid && !extValid) {
      throw new Error(
        'Unsupported file format. Please upload a PNG, JPG, JPEG, or WebP image.'
      );
    }

    if (typeof file.size === 'number') {
      if (file.size <= 0) {
        throw new Error('The selected image file is empty.');
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error('Image exceeds the 10MB maximum file size.');
      }
    }

    return true;
  },

  /**
   * Pure pixel-buffer analyzer for RGBA image data.
   * Determines:
   * 1. Whether the image has genuine alpha transparency (`hasMeaningfulTransparency`).
   * 2. Whether an opaque image has a grey-and-white checkerboard pattern baked into
   *    its background pixels (`hasBakedCheckerboard`).
   *
   * @param {Uint8ClampedArray|number[]} data - RGBA pixel array (length = width * height * 4)
   * @param {number} width - Image width in pixels
   * @param {number} height - Image height in pixels
   * @param {object} [options]
   * @param {boolean} [options.isPng] - Whether the file is a PNG
   */
  analyzeImagePixels(data, width, height, { isPng = true } = {}) {
    const totalPixels = width * height;
    if (!data || totalPixels <= 0) {
      return {
        hasMeaningfulTransparency: false,
        hasBakedCheckerboard: false,
        transparentRatio: 0,
        borderTransparentRatio: 0,
        warning: null,
      };
    }

    let transparentCount = 0;
    let borderPixels = 0;
    let borderTransparentCount = 0;

    const borderBandX = Math.max(2, Math.floor(width * 0.08));
    const borderBandY = Math.max(2, Math.floor(height * 0.08));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const alpha = data[idx + 3];

        if (alpha < 245) {
          transparentCount++;
        }

        // Check outer frame (top, left, right margins around a player cutout)
        const inOuterMargin =
          y < borderBandY || x < borderBandX || x >= width - borderBandX;
        if (inOuterMargin) {
          borderPixels++;
          if (alpha < 245) {
            borderTransparentCount++;
          }
        }
      }
    }

    const transparentRatio = transparentCount / totalPixels;
    const borderTransparentRatio =
      borderPixels > 0 ? borderTransparentCount / borderPixels : 0;

    // A genuine cutout has at least 2% transparent pixels overall or >= 5% along its outer margins
    const hasMeaningfulTransparency =
      transparentRatio >= 0.02 || borderTransparentRatio >= 0.05;

    if (hasMeaningfulTransparency) {
      return {
        hasMeaningfulTransparency: true,
        hasBakedCheckerboard: false,
        transparentRatio,
        borderTransparentRatio,
        warning: null,
      };
    }

    // If the image has NO meaningful transparency, inspect the top-left, top-right,
    // and upper background margins for a baked-in grey-and-white checkerboard pattern.
    const hasBakedCheckerboard = this.detectBakedCheckerboard(data, width, height);

    let warning = null;
    if (hasBakedCheckerboard) {
      warning =
        'Checkerboard background detected in image pixels: This file has no real alpha transparency (the grey-and-white grid is baked into the image). Upload a genuine transparent PNG cutout for a clean card background.';
    } else if (isPng) {
      warning =
        'Opaque PNG detected: This .png file has no transparent background pixels (100% opaque). It will appear as a rectangular photo unless you upload a transparent cutout.';
    }

    return {
      hasMeaningfulTransparency: false,
      hasBakedCheckerboard,
      transparentRatio,
      borderTransparentRatio,
      warning,
    };
  },

  /**
   * Detects whether an opaque RGBA buffer contains a baked-in light-grey / white
   * checkerboard pattern in its background corners/margins.
   */
  detectBakedCheckerboard(data, width, height) {
    if (width < 16 || height < 16) return false;

    const isNeutralCheckerShade = (r, g, b, a) => {
      if (a < 245) return false;
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      // Neutral grey or white (low saturation) and medium-to-high brightness
      return maxC - minC <= 14 && minC >= 140;
    };

    const getLuma = (x, y) => {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      if (!isNeutralCheckerShade(r, g, b, a)) return null;
      return Math.round((r + g + b) / 3);
    };

    // Inspect top-left corner, top-right corner, and upper-left/right strips
    const sampleRegions = [
      {
        x0: 2,
        y0: 2,
        x1: Math.max(10, Math.floor(width * 0.28)),
        y1: Math.max(10, Math.floor(height * 0.28)),
      },
      {
        x0: Math.min(width - 10, Math.floor(width * 0.72)),
        y0: 2,
        x1: width - 2,
        y1: Math.max(10, Math.floor(height * 0.28)),
      },
    ];

    let neutralSamples = 0;
    let totalSamples = 0;
    let alternatingTransitions = 0;
    const observedLumas = [];

    for (const reg of sampleRegions) {
      // Scan horizontal and vertical lines across the corner region
      for (let y = reg.y0; y < reg.y1; y += 2) {
        let prevBucket = null;
        let lastLuma = null;
        for (let x = reg.x0; x < reg.x1; x += 2) {
          totalSamples++;
          const luma = getLuma(x, y);
          if (luma !== null) {
            neutralSamples++;
            observedLumas.push(luma);
            // Classify into light-white (>= 232) vs checker-grey (145..226)
            const bucket = luma >= 232 ? 'W' : luma <= 226 ? 'G' : null;
            if (
              bucket &&
              prevBucket &&
              bucket !== prevBucket &&
              lastLuma !== null &&
              Math.abs(luma - lastLuma) >= 10
            ) {
              alternatingTransitions++;
            }
            if (bucket) {
              prevBucket = bucket;
              lastLuma = luma;
            }
          } else {
            prevBucket = null;
            lastLuma = null;
          }
        }
      }

      for (let x = reg.x0; x < reg.x1; x += 4) {
        let prevBucket = null;
        let lastLuma = null;
        for (let y = reg.y0; y < reg.y1; y += 2) {
          const luma = getLuma(x, y);
          if (luma !== null) {
            const bucket = luma >= 232 ? 'W' : luma <= 226 ? 'G' : null;
            if (
              bucket &&
              prevBucket &&
              bucket !== prevBucket &&
              lastLuma !== null &&
              Math.abs(luma - lastLuma) >= 10
            ) {
              alternatingTransitions++;
            }
            if (bucket) {
              prevBucket = bucket;
              lastLuma = luma;
            }
          } else {
            prevBucket = null;
            lastLuma = null;
          }
        }
      }
    }

    if (totalSamples === 0) return false;
    const neutralRatio = neutralSamples / totalSamples;

    // Check if there are both white-like and grey-like neutral values with repeated grid transitions
    const hasWhite = observedLumas.some((l) => l >= 232);
    const hasGrey = observedLumas.some((l) => l >= 145 && l <= 226);

    return neutralRatio >= 0.5 && hasWhite && hasGrey && alternatingTransitions >= 6;
  },

  /**
   * Decodes a File in the browser onto an alpha-enabled offscreen canvas
   * to inspect its actual pixel transparency and detect baked-in checkerboards.
   */
  inspectImageTransparency(file) {
    const isPng =
      file?.type === 'image/png' ||
      Boolean(file?.name && file.name.toLowerCase().endsWith('.png'));

    if (typeof document === 'undefined' || typeof FileReader === 'undefined') {
      return Promise.resolve({
        hasMeaningfulTransparency: true,
        hasBakedCheckerboard: false,
        transparentRatio: 1,
        borderTransparentRatio: 1,
        warning: null,
      });
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const natW = img.naturalWidth || img.width || 1;
          const natH = img.naturalHeight || img.height || 1;
          // Sample at up to 240x240 for fast, accurate pixel inspection
          const scale = Math.min(1, 240 / Math.max(natW, natH));
          const w = Math.max(1, Math.round(natW * scale));
          const h = Math.max(1, Math.round(natH * scale));

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d', {
            alpha: true,
            willReadFrequently: true,
          });
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);

          const imageData = ctx.getImageData(0, 0, w, h);
          const report = this.analyzeImagePixels(imageData.data, w, h, { isPng });
          resolve(report);
        };
        img.onerror = () =>
          resolve({
            hasMeaningfulTransparency: false,
            hasBakedCheckerboard: false,
            warning: null,
          });
        img.src = event.target.result;
      };
      reader.onerror = () =>
        resolve({
          hasMeaningfulTransparency: false,
          hasBakedCheckerboard: false,
          warning: null,
        });
      reader.readAsDataURL(file);
    });
  },

  /**
   * Generates an optimized Cloudinary delivery URL that explicitly preserves PNG
   * alpha transparency (`f_png,q_auto`) and natural aspect ratio (`c_limit`).
   */
  getOptimizedPortraitUrl(url, { width = 500, height = 620 } = {}) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';

    // Data URLs or local static assets are returned as-is
    if (trimmed.startsWith('data:') || trimmed.startsWith('/')) {
      return trimmed;
    }

    if (!trimmed.includes('res.cloudinary.com')) {
      return trimmed;
    }

    // Explicitly enforce `f_png,q_auto` on Cloudinary delivery URLs so transparent
    // PNG cutouts are never flattened by automatic format negotiation.
    if (trimmed.includes('/image/upload/')) {
      const afterUpload = trimmed.split('/image/upload/')[1] || '';

      // If an older transformation used f_auto, upgrade it to f_png
      if (afterUpload.startsWith('f_auto')) {
        return trimmed.replace('/image/upload/f_auto', '/image/upload/f_png');
      }

      const hasTransform =
        afterUpload.startsWith('f_') ||
        afterUpload.startsWith('q_') ||
        afterUpload.startsWith('w_') ||
        afterUpload.startsWith('c_');

      if (!hasTransform) {
        return trimmed.replace(
          '/image/upload/',
          `/image/upload/f_png,q_auto,w_${width},h_${height},c_limit/`
        );
      }
    }

    return trimmed;
  },

  /**
   * Uploads a player image (PNG, JPG, JPEG, WebP).
   * Inspects pixel transparency first, preserves RGBA alpha channel 100%,
   * and returns any transparency/checkerboard warning in `transparencyReport`.
   */
  async uploadPlayerImage(file, { onProgress } = {}) {
    this.validateImageFile(file);

    const cacheKey = `${file.name || 'img'}:${file.size || 0}:${file.lastModified || 0}`;
    if (uploadCache.has(cacheKey)) {
      if (onProgress) onProgress(100);
      return uploadCache.get(cacheKey);
    }

    if (onProgress) onProgress(15);

    // Inspect pixel alpha channel & check for baked-in checkerboard backgrounds
    const transparencyReport = await this.inspectImageTransparency(file);

    if (onProgress) onProgress(35);

    // 1. Direct upload to Cloudinary when configured
    if (this.isConfigured()) {
      try {
        const { cloudName, uploadPreset } = this.getConfig();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'supercup_players');

        if (onProgress) onProgress(60);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData?.error?.message || 'Cloudinary upload failed. Check upload preset.'
          );
        }

        const result = await response.json();
        const rawUrl = result.secure_url || result.url;
        const optimizedUrl = this.getOptimizedPortraitUrl(rawUrl);
        const output = {
          url: optimizedUrl,
          rawUrl,
          optimizedUrl,
          publicId: result.public_id,
          format: result.format || 'png',
          provider: 'cloudinary',
          transparencyReport,
        };

        uploadCache.set(cacheKey, output);
        if (onProgress) onProgress(100);
        return output;
      } catch (cloudErr) {
        console.warn(
          'Cloudinary direct upload unavailable, using lossless local PNG optimizer:',
          cloudErr.message
        );
      }
    }

    // 2. Client-side transparent-safe optimization (preserves PNG & WebP alpha channel 100%)
    if (onProgress) onProgress(70);
    const dataUrl = await this.optimizeImageToDataUrl(file, 480, 600, transparencyReport);
    const output = {
      url: dataUrl,
      rawUrl: dataUrl,
      optimizedUrl: dataUrl,
      publicId: null,
      format:
        transparencyReport?.hasMeaningfulTransparency ||
        file.type === 'image/png' ||
        (file.name && file.name.toLowerCase().endsWith('.png'))
          ? 'png'
          : 'webp',
      provider: 'local_optimized',
      transparencyReport,
    };

    uploadCache.set(cacheKey, output);
    if (onProgress) onProgress(100);
    return output;
  },

  /**
   * Resizes an image proportionally on an alpha-enabled canvas while preserving
   * PNG/WebP transparency (never flattens or converts transparent images into JPEG).
   */
  optimizeImageToDataUrl(file, maxWidth = 480, maxHeight = 600, transparencyReport = null) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (!width || !height) {
            reject(new Error('Invalid image dimensions.'));
            return;
          }

          // Scale proportionally within maxWidth x maxHeight
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const scale = Math.min(1, widthRatio, heightRatio);

          width = Math.max(1, Math.round(width * scale));
          height = Math.max(1, Math.round(height * scale));

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d', { alpha: true });
          ctx.clearRect(0, 0, width, height);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const isPng =
            file.type === 'image/png' ||
            (file.name && file.name.toLowerCase().endsWith('.png')) ||
            Boolean(transparencyReport?.hasMeaningfulTransparency);
          const isWebp =
            file.type === 'image/webp' ||
            (file.name && file.name.toLowerCase().endsWith('.webp'));

          if (isPng) {
            // Strictly preserve 32-bit RGBA PNG format & full alpha transparency
            resolve(canvas.toDataURL('image/png'));
          } else if (isWebp) {
            resolve(canvas.toDataURL('image/webp', 0.92));
          } else {
            resolve(canvas.toDataURL('image/jpeg', 0.9));
          }
        };
        img.onerror = () =>
          reject(
            new Error('Could not decode image file. Please try another PNG, JPG, or WebP.')
          );
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read the selected file.'));
      reader.readAsDataURL(file);
    });
  },
};

export default cloudinaryService;
