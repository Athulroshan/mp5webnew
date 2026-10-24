import { put, get, del } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export interface StorageResult {
  url: string;
  filename: string;
  pathname: string;
  isPrivate?: boolean;
  size?: number;
}

export interface SaveFileOptions {
  access?: 'public' | 'private';
  contentType?: string;
}

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Check if Supabase Storage is configured.
 */
/**
 * Inspection Blob Storage Manager
 *
 * Supports dual Vercel Blob stores:
 * 1. 'mp5webnew-public-image': New Public Blob store for all new inspection photos.
 *    Uses custom prefix token (e.g. MP5WEBNEW_PUBLIC_IMAGE_READ_WRITE_TOKEN).
 * 2. 'mp5webnew-blob': Old Private Blob store for historical records.
 *    Uses private token (e.g. BLOB_READ_WRITE_TOKEN or MP5WEBNEW_BLOB_READ_WRITE_TOKEN).
 */

/**
 * Inspect the environment variable names available for Blob stores without printing secrets.
 */
export function inspectBlobEnvironment(): {
  publicTokenKey: string | null;
  publicStoreIdKey: string | null;
  privateTokenKey: string | null;
  detectedKeys: string[];
} {
  const envKeys = Object.keys(process.env);
  const detectedKeys = envKeys.filter((k) =>
    /blob|mp5webnew|public.*image|image.*blob/i.test(k)
  );

  let publicTokenKey: string | null = null;
  let publicStoreIdKey: string | null = null;
  let privateTokenKey: string | null = null;

  // Candidates for Public store token
  const publicCandidates = [
    'PUBLIC_BLOB_READ_WRITE_TOKEN',
    'MP5WEBNEW_PUBLIC_IMAGE_READ_WRITE_TOKEN',
    'MP5WEBNEW_PUBLIC_IMAGE_TOKEN',
    'PUBLIC_IMAGE_READ_WRITE_TOKEN',
    'PUBLIC_IMAGE_BLOB_READ_WRITE_TOKEN',
    'BLOB_PUBLIC_READ_WRITE_TOKEN',
  ];

  for (const cand of publicCandidates) {
    if (process.env[cand]) {
      publicTokenKey = cand;
      break;
    }
  }

  if (!publicTokenKey) {
    const dynamicKey = envKeys.find((key) => {
      const k = key.toUpperCase();
      return (
        (k.includes('MP5WEBNEW_PUBLIC_IMAGE') || (k.includes('PUBLIC_IMAGE') && k.includes('READ_WRITE'))) ||
        (k.includes('PUBLIC') && k.includes('BLOB') && (k.includes('TOKEN') || k.includes('READ_WRITE')))
      );
    });
    if (dynamicKey && process.env[dynamicKey]) {
      publicTokenKey = dynamicKey;
    }
  }

  // Candidates for Public store ID
  const storeIdCandidates = [
    'PUBLIC_BLOB_STORE_ID',
    'MP5WEBNEW_PUBLIC_IMAGE_STORE_ID',
    'PUBLIC_IMAGE_STORE_ID',
    'BLOB_STORE_ID',
  ];

  for (const cand of storeIdCandidates) {
    if (process.env[cand]) {
      publicStoreIdKey = cand;
      break;
    }
  }

  // Candidates for Private store
  const privateCandidates = [
    'PRIVATE_BLOB_READ_WRITE_TOKEN',
    'MP5WEBNEW_BLOB_READ_WRITE_TOKEN',
    'MP5WEBNEW_BLOB_TOKEN',
  ];

  for (const cand of privateCandidates) {
    if (process.env[cand]) {
      privateTokenKey = cand;
      break;
    }
  }

  // Standard fallback
  if (!publicTokenKey && process.env.BLOB_READ_WRITE_TOKEN) {
    publicTokenKey = 'BLOB_READ_WRITE_TOKEN';
  }
  if (!privateTokenKey && process.env.BLOB_READ_WRITE_TOKEN) {
    privateTokenKey = 'BLOB_READ_WRITE_TOKEN';
  }

  return { publicTokenKey, publicStoreIdKey, privateTokenKey, detectedKeys };
}

/**
 * Resolves the read-write token for the new Public Blob store ('mp5webnew-public-image').
 */
export function getPublicBlobToken(): string | undefined {
  const { publicTokenKey } = inspectBlobEnvironment();
  if (publicTokenKey && process.env[publicTokenKey]) {
    return process.env[publicTokenKey];
  }
  return undefined;
}

/**
 * Resolves the store ID for the new Public Blob store ('mp5webnew-public-image').
 */
export function getPublicBlobStoreId(): string | undefined {
  const { publicStoreIdKey } = inspectBlobEnvironment();
  if (publicStoreIdKey && process.env[publicStoreIdKey]) {
    return process.env[publicStoreIdKey];
  }
  return undefined;
}

/**
 * Resolves the read-write token for the old Private Blob store ('mp5webnew-blob').
 */
export function getPrivateBlobToken(): string | undefined {
  const { privateTokenKey } = inspectBlobEnvironment();
  if (privateTokenKey && process.env[privateTokenKey]) {
    return process.env[privateTokenKey];
  }
  return undefined;
}

/**
 * Check if the Public Blob store is configured.
 */
export function isPublicBlobConfigured(): boolean {
  return Boolean(getPublicBlobToken() || getPublicBlobStoreId() || process.env.VERCEL);
}

/**
 * Check if Supabase Storage is configured.
 */
export function isSupabaseStorageConfigured(): boolean {
  return Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)
  );
}

/**
 * Check if Vercel Blob is configured.
 */
export function isBlobConfigured(): boolean {
  return Boolean(getPublicBlobToken() || getPrivateBlobToken() || process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL);
}

/**
 * Save file to persistent storage:
 * Priority 1: New Public Vercel Blob store ('mp5webnew-public-image') with access: 'public'.
 * Priority 2: Supabase Storage (if configured).
 * Priority 3: Local public/ fallback in development.
 */
export async function saveFile(
  pathname: string,
  buffer: Buffer,
  options: SaveFileOptions = {}
): Promise<StorageResult> {
  const cleanPath = pathname.replace(/^\/+/, '');
  const filename = path.basename(cleanPath);
  const publicToken = getPublicBlobToken();
  const publicStoreId = getPublicBlobStoreId();

  // Priority 1: New Public Vercel Blob store ('mp5webnew-public-image')
  if (publicToken || publicStoreId || process.env.VERCEL) {
    try {
      const putOptions: any = {
        access: 'public',
        contentType: options.contentType || 'image/jpeg',
      };
      if (publicToken) {
        putOptions.token = publicToken;
      }
      if (publicStoreId) {
        putOptions.storeId = publicStoreId;
      }

      const blob = await put(cleanPath, buffer, putOptions);

      // Return the direct public URL returned by put(...)
      return {
        url: blob.url,
        filename,
        pathname: blob.pathname,
        isPrivate: false,
        size: buffer.length,
      };
    } catch (blobErr: any) {
      console.warn('[STORAGE] Public Vercel Blob put failed:', blobErr.message);
      if (process.env.NODE_ENV === 'production' && !isSupabaseStorageConfigured()) {
        throw blobErr;
      }
    }
  }

  // Priority 2: Supabase Storage fallback
  if (isSupabaseStorageConfigured()) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/storage/v1/object/inspection-uploads/${filename}`, {
        method: 'POST',
        headers: {
          apikey: anonKey!,
          Authorization: `Bearer ${anonKey}`,
          'Content-Type': options.contentType || 'image/jpeg',
          'x-upsert': 'true',
        },
        body: new Uint8Array(buffer),
      });

      if (res.ok) {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/inspection-uploads/${filename}`;
        return {
          url: publicUrl,
          filename,
          pathname: `inspection-uploads/${filename}`,
          isPrivate: false,
          size: buffer.length,
        };
      } else {
        const errText = await res.text();
        console.warn(`[STORAGE] Supabase Storage upload HTTP ${res.status}:`, errText);
      }
    } catch (err: any) {
      console.warn('[STORAGE] Supabase Storage network error:', err.message);
    }
  }

  // Priority 3: Local public/ filesystem fallback for development
  const localDest = path.join(process.cwd(), 'public', cleanPath);
  const dir = path.dirname(localDest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(localDest, buffer);

  return {
    url: `/${cleanPath.replace(/\\/g, '/')}`,
    filename,
    pathname: cleanPath,
    isPrivate: false,
    size: buffer.length,
  };
}

/**
 * Upload an image file to persistent storage.
 * Enforces size limits and allowed MIME types.
 */
export async function uploadFile(
  filename: string,
  buffer: Buffer,
  contentType: string = 'image/jpeg'
): Promise<StorageResult> {
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds the 10 MB limit.`);
  }

  const normalizedContentType = contentType.toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(normalizedContentType)) {
    throw new Error(`Unsupported content type "${contentType}". Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  return saveFile(`uploads/${filename}`, buffer, {
    contentType: normalizedContentType,
    access: 'public',
  });
}

/**
 * Fetch a file from either Vercel Blob, Supabase Storage, external URL, or local public filesystem.
 * Handles both public blobs and legacy private blobs safely.
 */
export async function getFileStream(
  urlOrPath: string
): Promise<{ stream: ReadableStream | NodeJS.ReadableStream | Buffer; contentType: string; filename: string }> {
  const filename = path.basename(urlOrPath.split('?')[0]);

  // Case 1: Remote URLs (HTTP / HTTPS)
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    // Legacy Private Vercel Blob
    if (urlOrPath.includes('private.blob.vercel-storage.com')) {
      const privateToken = getPrivateBlobToken();
      try {
        const blobRes = await get(urlOrPath, {
          access: 'private',
          ...(privateToken ? { token: privateToken } : {}),
        });
        if (blobRes && blobRes.stream) {
          return {
            stream: blobRes.stream,
            contentType: blobRes.blob.contentType || 'application/octet-stream',
            filename,
          };
        }
        throw new Error('Private blob not found or stream unavailable');
      } catch (err: any) {
        console.warn(`[STORAGE] Private blob get failed for ${urlOrPath}:`, err?.message);
        throw new Error(`Private blob inaccessible: ${err?.message || 'Access error'}`);
      }
    }

    // Public Blob or external URL
    const res = await fetch(urlOrPath);
    if (!res.ok) {
      throw new Error(`Failed to fetch file (${res.status}): ${res.statusText}`);
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

  // Case 2: Supabase Storage public URL if relativePath is in inspection-uploads or uploads
  if (isSupabaseStorageConfigured()) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const objectName = path.basename(relativePath);
    const supabasePublicUrl = `${supabaseUrl}/storage/v1/object/public/inspection-uploads/${objectName}`;
    try {
      const res = await fetch(supabasePublicUrl);
      if (res.ok && res.body) {
        return {
          stream: res.body,
          contentType: res.headers.get('content-type') || 'application/octet-stream',
          filename,
        };
      }
    } catch (e) {
      // Continue to next fallback
    }
  }

  // Case 3: Relative pathname in Vercel Blob storage
  const publicToken = getPublicBlobToken();
  const privateToken = getPrivateBlobToken();

  if (publicToken || isBlobConfigured()) {
    // Try Public store first
    try {
      const publicBlobRes = await get(relativePath, {
        access: 'public',
        ...(publicToken ? { token: publicToken } : {}),
      }).catch(() => null);
      if (publicBlobRes && publicBlobRes.stream) {
        return {
          stream: publicBlobRes.stream,
          contentType: publicBlobRes.blob.contentType || 'application/octet-stream',
          filename,
        };
      }
    } catch (e) {}

    // Try Private store fallback
    try {
      const privateBlobRes = await get(relativePath, {
        access: 'private',
        ...(privateToken ? { token: privateToken } : {}),
      }).catch(() => null);
      if (privateBlobRes && privateBlobRes.stream) {
        return {
          stream: privateBlobRes.stream,
          contentType: privateBlobRes.blob.contentType || 'application/octet-stream',
          filename,
        };
      }
    } catch (e) {}
  }

  // Case 4: Local public filesystem fallback
  const localPath = path.join(process.cwd(), 'public', relativePath);
  if (fs.existsSync(localPath)) {
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

  throw new Error(`File not found: ${urlOrPath}`);
}
