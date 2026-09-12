import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle base64 JSON upload
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { image, filename } = body;

      if (!image) {
        return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
      }

      const matches = image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json({ error: 'Invalid base64 image data' }, { status: 400 });
      }

      const ext = matches[1].toLowerCase() === 'jpg' ? 'jpeg' : matches[1].toLowerCase();
      const buffer = Buffer.from(matches[2], 'base64');

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeFilename = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const filePath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${safeFilename}`,
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

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.jpg';
    const safeFilename = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    const filePath = path.join(uploadsDir, safeFilename);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${safeFilename}`,
      filename: safeFilename,
    });
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
