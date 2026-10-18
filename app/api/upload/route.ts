import { NextResponse } from 'next/server';
import path from 'path';
import { saveFile } from '@/lib/storage';

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
      const buffer = Buffer.from(matches[2], 'base64');
      const safeFilename = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

      const saved = await saveFile(`uploads/${safeFilename}`, buffer, {
        contentType: `image/${ext}`,
      });

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.jpg';
    const safeFilename = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;

    const saved = await saveFile(`uploads/${safeFilename}`, buffer, {
      contentType: file.type || 'image/jpeg',
    });

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
