import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { changeReason, performedByName = 'QA Supervisor' } = body;

    if (!changeReason || changeReason.trim() === '') {
      return NextResponse.json({ error: 'A valid Reason for Change is mandatory when reopening a finalized inspection.' }, { status: 400 });
    }

    const inspection = await prisma.inspection.findUnique({
      where: { id },
    });

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection record not found' }, { status: 404 });
    }

    const currentVer = inspection.currentVersion || 1;
    const nextVersion = currentVer + 1;

    // Snapshot version N before creating version N+1
    const fullInspectionWithRelations = await prisma.inspection.findUnique({
      where: { id },
      include: { measurements: true, defects: true, photos: true },
    });

    await prisma.inspectionVersion.create({
      data: {
        inspectionId: id,
        versionNumber: currentVer,
        excelFilePath: inspection.excelFilePath || '',
        changeReason: changeReason,
        createdByName: performedByName,
        inspectionPayload: JSON.stringify(fullInspectionWithRelations),
      },
    });

    const updatedInspection = await prisma.inspection.update({
      where: { id },
      data: {
        status: 'REVISED',
        currentVersion: nextVersion,
      },
    });

    await prisma.inspectionAuditLog.create({
      data: {
        inspectionId: id,
        versionNumber: nextVersion,
        action: 'REVISION_CREATED',
        performedByName,
        details: `Reopened inspection for revision. Created Version ${nextVersion}. Reason: ${changeReason}`,
      },
    });

    return NextResponse.json({
      success: true,
      nextVersion,
      inspection: updatedInspection,
      message: `Inspection ${inspection.inspectionNumber} reopened for Version ${nextVersion}`,
    });
  } catch (error: any) {
    console.error('Error reopening inspection:', error);
    return NextResponse.json({ error: error.message || 'Reopen failed' }, { status: 500 });
  }
}
