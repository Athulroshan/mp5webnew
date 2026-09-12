import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const finalizedBy = body.finalizedBy || 'QA Supervisor';

    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        measurements: true,
        defects: true,
        photos: true,
        versions: true,
      },
    });

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection record not found' }, { status: 404 });
    }

    const currentVersion = inspection.currentVersion || 1;

    // Update status to finalized
    const updatedInspection = await prisma.inspection.update({
      where: { id },
      data: {
        status: 'FINALIZED',
        finalizedAt: new Date(),
        finalizedBy,
      },
    });

    // Check if version record already exists for currentVersion
    const existingVersion = await prisma.inspectionVersion.findFirst({
      where: { inspectionId: id, versionNumber: currentVersion },
    });

    if (!existingVersion) {
      await prisma.inspectionVersion.create({
        data: {
          inspectionId: id,
          versionNumber: currentVersion,
          excelFilePath: inspection.excelFilePath || '',
          changeReason: currentVersion === 1 ? 'Initial inspection finalization' : 'Updated inspection finalization',
          createdByName: finalizedBy,
          inspectionPayload: JSON.stringify(inspection),
        },
      });
    }

    // Add Audit Log
    await prisma.inspectionAuditLog.create({
      data: {
        inspectionId: id,
        versionNumber: currentVersion,
        action: 'FINALIZED',
        performedByName: finalizedBy,
        details: `Finalized Version ${currentVersion} for PO: ${inspection.poNumber}`,
      },
    });

    return NextResponse.json({
      success: true,
      inspection: updatedInspection,
      message: `Inspection ${inspection.inspectionNumber} Version ${currentVersion} finalized successfully`,
    });
  } catch (error: any) {
    console.error('Error finalizing inspection:', error);
    return NextResponse.json({ error: error.message || 'Finalization failed' }, { status: 500 });
  }
}
