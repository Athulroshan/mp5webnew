import { NextResponse } from 'next/server';
import path from 'path';
import { uploadFile, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const contentTypeHeader = req.headers.get('content-type') || '';

    // Handle base64 JSON upload
    if (contentTypeHeader.includes('application/json')) {
      const body = await req.json();
      const { image, filename } = body;

      if (!image) {
        return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
      }

      const matches = image.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json({ error: 'Invalid base64 image data' }, { status: 400 });
      }

      const rawExt = matches[1].toLowerCase();
      const ext = rawExt === 'jpg' ? 'jpeg' : rawExt;
      const mimeType = `image/${ext}`;

      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return NextResponse.json(
          { error: `Unsupported image format. Allowed formats: JPG, PNG, WEBP, GIF` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(matches[2], 'base64');
      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File size exceeds 10MB limit.` },
          { status: 413 }
        );
      }

      const safeFilename = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const saved = await uploadFile(safeFilename, buffer, mimeType);

      return NextResponse.json({
        success: true,
        url: saved.url,
        filename: safeFilename,
      });
    }

    // Handle multipart form data upload
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const mimeType = (file.type || 'image/jpeg').toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported image format (${mimeType}). Allowed formats: JPG, PNG, WEBP, GIF` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds 10MB limit.` },
        { status: 413 }
      );
    }

    const extFromName = path.extname(file.name).toLowerCase();
    const ext = extFromName || (mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg');
    const safeFilename = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext.startsWith('.') ? ext : `.${ext}`}`;

    const saved = await uploadFile(safeFilename, buffer, mimeType);

    return NextResponse.json({
      success: true,
      url: saved.url,
      filename: safeFilename,
    });
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
