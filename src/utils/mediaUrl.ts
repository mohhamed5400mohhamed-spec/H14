/**
 * Shared media URL detection, normalization, and upload limit constants.
 * Ensures videos with query strings and iPhone HEVC/.mov Cloudinary assets play reliably across browsers.
 */

export const MAX_MEDIA_UPLOAD_MB = 50;
export const MAX_MEDIA_UPLOAD_BYTES = MAX_MEDIA_UPLOAD_MB * 1024 * 1024;

const VIDEO_EXT_PATTERN = /\.(mp4|webm|mov|m4v|ogg|3gp|mkv|avi)(\?|#|$)/i;

export function isVideoMediaUrl(url?: string | null, mediaType?: string | null): boolean {
  if (mediaType === 'video') return true;
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:video')) return true;
  return VIDEO_EXT_PATTERN.test(trimmed);
}

/**
 * Rewrites Cloudinary raw `.mov`/`.3gp`/`.mkv`/`.avi` video URLs on the fly to H.264 `.mp4`
 * (`f_mp4,vc_h264`) so iPhone recordings play seamlessly on Android/Chrome/Windows.
 */
export function normalizePlayableVideoUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Cloudinary video delivery optimization for non-MP4 mobile containers
  if (
    /res\.cloudinary\.com\/.+\/video\/upload\//i.test(trimmed) &&
    /\.(mov|3gp|mkv|avi)(\?|#|$)/i.test(trimmed)
  ) {
    const transformed = trimmed.includes('/video/upload/f_mp4')
      ? trimmed
      : trimmed.replace('/video/upload/', '/video/upload/f_mp4,vc_h264,ac_aac/');
    return transformed.replace(/\.(mov|3gp|mkv|avi)(?=(\?|#|$))/i, '.mp4');
  }

  return trimmed;
}
