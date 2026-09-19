/**
 * SUPERSNAKE CLIENT-SIDE IMAGE OPTIMIZER
 * Compresses and resizes high-resolution photography on the client before saving.
 * - Resizes images to max 1800x1800 (retina display quality).
 * - Converts to WebP (with JPEG fallback) at 85% quality.
 * - Reduces 5MB-15MB raw photos down to ~150KB-250KB each.
 * - Enables multiple images to be stored in localStorage, sent over HTTP, and saved to Supabase without quota errors.
 */

export async function compressImage(
  file: File,
  maxWidth: number = 1800,
  maxHeight: number = 1800,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if it's an image file or has an image extension
    const isImage =
      file.type.startsWith('image/') ||
      /\.(jpe?g|png|webp|avif|gif|bmp|heic|heif)$/i.test(file.name);

    if (!isImage) {
      return reject(new Error('Selected file is not a supported image format.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) {
        return reject(new Error('Empty image file content.'));
      }

      // If it's an SVG, base64 is already small and vector-based; no need to rasterize onto canvas
      if (file.type === 'image/svg+xml' || src.startsWith('data:image/svg+xml')) {
        return resolve(src);
      }

      const img = new Image();
      img.onerror = () => {
        // In case of decoding error (e.g., HEIC not natively supported by browser's Image), return raw src as fallback
        resolve(src);
      };
      img.onload = () => {
        try {
          let { width, height } = img;

          // If image is already smaller than max dimensions and under 400KB, keep it
          if (width <= maxWidth && height <= maxHeight && file.size < 400 * 1024) {
            return resolve(src);
          }

          // Maintain aspect ratio
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(src);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Try exporting as WebP first
          let output = canvas.toDataURL('image/webp', quality);
          // If browser doesn't support webp encoding in canvas, fallback to jpeg
          if (!output.startsWith('data:image/webp')) {
            output = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(output);
        } catch (err) {
          console.warn('Canvas compression error, using original src:', err);
          resolve(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
