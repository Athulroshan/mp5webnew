import { put, get, del } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export interface StorageResult {
  url: string;
  pathname: string;
  isPrivate: boolean;
  size?: number;
}

export interface SaveFileOptions {
  access?: 'public' | 'private';
  contentType?: string;
}

/**
 * Check if Vercel Blob is configured either through token or Vercel environment.
 */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL);
}

/**
 * Save file to persistent storage (Vercel Blob in production, local public/ fallback in dev).
 */
export async function saveFile(
  pathname: string,
  buffer: Buffer,
  options: SaveFileOptions = {}
): Promise<StorageResult> {
  const cleanPath = pathname.replace(/^\/+/, '');
  const preferredAccess = options.access || (process.env.BLOB_DEFAULT_ACCESS === 'public' ? 'public' : 'private');

  if (isBlobConfigured()) {
    try {
      // Attempt upload with desired access level
      const blob = await put(cleanPath, buffer, {
        access: preferredAccess,
        contentType: options.contentType,
      });

      const isPrivate = preferredAccess === 'private';
      // If private, serve through authenticated proxy route so browsers can render <img>
      const clientUrl = isPrivate
        ? `/api/files?url=${encodeURIComponent(blob.url)}&pathname=${encodeURIComponent(blob.pathname)}`
        : blob.url;

      return {
        url: clientUrl,
        pathname: blob.pathname,
        isPrivate,
      };
    } catch (blobErr: any) {
      // If store was created with public-only access, fallback gracefully to public
      if (preferredAccess === 'private' && blobErr?.message?.includes('private')) {
        console.warn('[STORAGE] Private access not supported on this Blob store. Falling back to public access:', blobErr.message);
        const publicBlob = await put(cleanPath, buffer, {
          access: 'public',
          contentType: options.contentType,
        });
        return {
          url: publicBlob.url,
          pathname: publicBlob.pathname,
          isPrivate: false,
        };
      }
      throw blobErr;
    }
  }

  // Local development fallback when no Vercel Blob token is set
  const localDest = path.join(process.cwd(), 'public', cleanPath);
  const dir = path.dirname(localDest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(localDest, buffer);

  return {
    url: `/${cleanPath.replace(/\\/g, '/')}`,
    pathname: cleanPath,
    isPrivate: false,
    size: buffer.length,
  };
}

/**
 * Fetch a file from either Vercel Blob (private/public), external URL, or local public filesystem.
 */
export async function getFileStream(
  urlOrPath: string
): Promise<{ stream: ReadableStream | NodeJS.ReadableStream | Buffer; contentType: string; filename: string }> {
  const filename = path.basename(urlOrPath.split('?')[0]);

  // Case 1: Remote Vercel Blob or external URL
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    // Check if private blob
    if (urlOrPath.includes('private.blob.vercel-storage.com')) {
      const blobRes = await get(urlOrPath, { access: 'private' });
      if (!blobRes || !blobRes.stream) {
        throw new Error('Private blob not found');
      }
      return {
        stream: blobRes.stream,
        contentType: blobRes.blob.contentType || 'application/octet-stream',
        filename,
      };
    }

    // Standard public URL or blob
    const res = await fetch(urlOrPath);
    if (!res.ok) {
      throw new Error(`Failed to fetch file: ${res.statusText}`);
    }
    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    if (!res.body) {
      throw new Error('No response body from remote file');
    }
    return {
      stream: res.body,
      contentType,
      filename,
    };
  }

  const relativePath = urlOrPath.replace(/^\/+/, '');

  // Case 2: Relative pathname in Vercel Blob storage (e.g. "reports/MPSS_..." or "uploads/photo_...")
  if (isBlobConfigured()) {
    try {
      const privateBlobRes = await get(relativePath, { access: 'private' }).catch(() => null);
      if (privateBlobRes && privateBlobRes.stream) {
        return {
          stream: privateBlobRes.stream,
          contentType: privateBlobRes.blob.contentType || 'application/octet-stream',
          filename,
        };
      }
    } catch (e) {
      // Continue to public check
    }

    try {
      const publicBlobRes = await get(relativePath, { access: 'public' }).catch(() => null);
      if (publicBlobRes && publicBlobRes.stream) {
        return {
          stream: publicBlobRes.stream,
          contentType: publicBlobRes.blob.contentType || 'application/octet-stream',
          filename,
        };
      }
    } catch (e) {
      // Continue to local fallback
    }
  }

  // Case 3: Local public filesystem fallback
  const localPath = path.join(process.cwd(), 'public', relativePath);
  if (!fs.existsSync(localPath)) {
    throw new Error(`File not found: ${urlOrPath}`);
  }

  const buffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  else if (ext === '.pdf') contentType = 'application/pdf';

  return {
    stream: buffer,
    contentType,
    filename,
  };
}
