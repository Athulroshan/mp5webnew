/**
 * Inspection Image Utilities
 * Client-safe helpers for resolving and displaying inspection and defect photos.
 */

/**
 * Resolves an inspection photo URL safely for client-side rendering.
 *
 * Rules:
 * 1. Base64 data URLs: returned directly.
 * 2. Already proxied URLs (/api/files?url=...): returned directly.
 * 3. Private Vercel Blob URLs (*.private.blob.vercel-storage.com): routed through /api/files proxy.
 * 4. Public Vercel Blob URLs (*.public.blob.vercel-storage.com): returned directly (direct CDN delivery).
 * 5. Other external HTTP/HTTPS URLs: returned directly.
 * 6. Local uploads (/uploads/...): returned with leading slash.
 * 7. Empty, null, or undefined: returns empty string.
 */
export function getSafeInspectionImageUrl(photoUrl: string | undefined | null): string {
  if (!photoUrl || typeof photoUrl !== 'string') return '';
  const trimmed = photoUrl.trim();
  if (!trimmed) return '';

  // Base64 data URLs
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Already proxied via /api/files
  if (trimmed.startsWith('/api/files')) {
    return trimmed;
  }

  // Private Blob store URLs require server-side token authentication via /api/files
  if (trimmed.includes('private.blob.vercel-storage.com')) {
    return `/api/files?url=${encodeURIComponent(trimmed)}`;
  }

  // Public Blob store URLs or external HTTP/HTTPS URLs can be loaded directly by the browser
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Relative or local upload paths
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed}`;
}
