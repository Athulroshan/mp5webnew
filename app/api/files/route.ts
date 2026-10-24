import { NextRequest, NextResponse } from 'next/server';
import { getFileStream } from '@/lib/storage';

// 1x1 transparent PNG fallback for missing or deleted legacy files
const FALLBACK_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url') || searchParams.get('pathname');

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing file URL or pathname' }, { status: 400 });
    }

    // SSRF & target validation
    const isBlobUrl = targetUrl.includes('.blob.vercel-storage.com');
    const isLocalUpload =
      targetUrl.startsWith('/uploads/') ||
      targetUrl.startsWith('uploads/') ||
      targetUrl.startsWith('/images/') ||
      targetUrl.startsWith('images/');
    const isSupabaseUrl = targetUrl.includes('/storage/v1/object/');

    if (!isBlobUrl && !isLocalUpload && !isSupabaseUrl && !targetUrl.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid file target' }, { status: 400 });
    }

    // If the target is already a public Vercel Blob URL, redirect directly to CDN
    if (targetUrl.includes('.public.blob.vercel-storage.com')) {
      return NextResponse.redirect(targetUrl, 307);
    }

    // Attempt to load the file stream safely
    let fileResult = null;
    try {
      fileResult = await getFileStream(targetUrl);
    } catch (streamErr: any) {
      console.warn(`[FILES ROUTE] File could not be retrieved: ${targetUrl}`, streamErr?.message);
    }

    // Graceful handling of missing or deleted legacy records
    if (!fileResult) {
      const isImageRequest =
        req.headers.get('accept')?.includes('image/') ||
        Boolean(targetUrl.match(/\.(jpg|jpeg|png|webp|gif)/i));

      if (isImageRequest) {
        return new NextResponse(new Uint8Array(FALLBACK_PNG), {
          status: 404,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=300',
            'X-Fallback': 'true',
          },
        });
      }

      return NextResponse.json(
        { error: 'File not found or no longer accessible' },
        { status: 404 }
      );
    }

    const { stream, contentType, filename } = fileResult;

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    };

    if (Buffer.isBuffer(stream)) {
      return new NextResponse(new Uint8Array(stream), {
        status: 200,
        headers,
      });
    }

    return new NextResponse(stream as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('[FILES ROUTE ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Error retrieving file' },
      { status: 500 }
    );
  }
}
