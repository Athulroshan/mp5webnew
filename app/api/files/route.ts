import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getFileStream } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url') || searchParams.get('pathname');

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing file URL or pathname' }, { status: 400 });
    }

    // Inspection documents and photos are sensitive: verify user authorization
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      // Allow inspection images if authenticated or if token header is present
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stream, contentType, filename } = await getFileStream(targetUrl);

    // If stream is a Buffer
    if (Buffer.isBuffer(stream)) {
      return new NextResponse(new Uint8Array(stream), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${filename}"`,
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }

    // Stream the response directly to client
    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('[FILES ROUTE ERROR]', err);
    return NextResponse.json({ error: err.message || 'File not found or accessible' }, { status: 404 });
  }
}
