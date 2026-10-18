import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getFileStream } from '@/lib/storage';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate user before allowing report download
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const inspection = await prisma.inspection.findUnique({
      where: { id },
    });

    if (!inspection || !inspection.excelFilePath) {
      return NextResponse.json({ error: 'Report file not found or not generated yet' }, { status: 404 });
    }

    const { stream, contentType, filename } = await getFileStream(inspection.excelFilePath);
    const safeFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;

    if (Buffer.isBuffer(stream)) {
      return new NextResponse(new Uint8Array(stream), {
        status: 200,
        headers: {
          'Content-Type': contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${safeFilename}"`,
        },
      });
    }

    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error downloading report:', error);
    return NextResponse.json({ error: error.message || 'Download failed' }, { status: 500 });
  }
}
