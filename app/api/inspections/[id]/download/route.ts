import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const inspection = await prisma.inspection.findUnique({
      where: { id },
    });

    if (!inspection || !inspection.excelFilePath) {
      return NextResponse.json({ error: 'Report file not found or not generated yet' }, { status: 404 });
    }

    const relativePath = inspection.excelFilePath.startsWith('/') ? inspection.excelFilePath.slice(1) : inspection.excelFilePath;
    const filePath = path.join(process.cwd(), 'public', relativePath);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `File missing on server: ${filePath}` }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const filename = path.basename(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error downloading report:', error);
    return NextResponse.json({ error: error.message || 'Download failed' }, { status: 500 });
  }
}
