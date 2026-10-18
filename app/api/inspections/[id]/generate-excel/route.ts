import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateInspectionExcelReport } from '@/lib/excel-generator';


export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        measurements: true,
        defects: true,
        photos: true,
      },
    });

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection record not found' }, { status: 404 });
    }

    const payload = {
      id: inspection.id,
      inspectionNumber: inspection.inspectionNumber,
      poNumber: inspection.poNumber,
      poQuantity: inspection.poQuantity,
      inspectionQuantity: inspection.inspectionQuantity,
      factoryName: inspection.factoryName,
      agentName: inspection.agentName,
      season: inspection.season,
      buyerBrand: inspection.buyerBrand,
      styleNumber: inspection.styleNumber,
      productDescription: inspection.productDescription,
      inspectionDate: inspection.inspectionDate,
      inspectorName: inspection.inspectorName,
      visualAuditResult: inspection.visualAuditResult,
      packingAuditResult: inspection.packingAuditResult,
      overallResult: inspection.overallResult,
      comments: inspection.comments,
      itemsToCheck: inspection.itemsToCheck ? JSON.parse(inspection.itemsToCheck) : [],
      shipmentDetails: inspection.shipmentDetails ? JSON.parse(inspection.shipmentDetails) : {},
      cartonDetails: inspection.cartonDetails ? JSON.parse(inspection.cartonDetails) : [],
      capDetails: inspection.capDetails ? JSON.parse(inspection.capDetails) : [],
      measurements: inspection.measurements.map((m) => ({
        measurementPoint: m.measurementPoint,
        specRequired: m.specRequired,
        tolerance: m.tolerance,
        actualValues: m.actualValues ? JSON.parse(m.actualValues) : [],
        result: m.result,
      })),
      defects: inspection.defects.map((d) => ({
        defectCode: d.defectCode,
        description: d.description,
        location: d.location,
        severity: d.severity,
        quantity: d.quantity,
        photoUrl: d.photoUrl,
      })),
      currentVersion: inspection.currentVersion || 1,
      photos: inspection.photos.map((p) => ({
        type: p.type as any,
        photoUrl: p.photoUrl,
        description: p.description,
      })),
    };

    const result = await generateInspectionExcelReport(payload);

    await prisma.inspection.update({
      where: { id },
      data: {
        status: inspection.status === 'FINALIZED' ? 'FINALIZED' : 'ready_for_review',
        excelFilePath: result.relativeUrl,
      },
    });

    await prisma.inspectionAuditLog.create({
      data: {
        inspectionId: id,
        versionNumber: inspection.currentVersion || 1,
        action: 'REPORT_GENERATED',
        performedByName: inspection.inspectorName || 'QA Auditor',
        details: `Generated report file ${result.filename}`,
      },
    });

    return NextResponse.json({
      success: true,
      inspectionNumber: inspection.inspectionNumber,
      filename: result.filename,
      downloadUrl: result.relativeUrl,
      pdfUrl: result.relativePdfUrl || result.relativeUrl.replace('.xlsx', '.pdf'),
      version: inspection.currentVersion || 1,
    });
  } catch (error: any) {
    console.error('Error generating Excel report:', error);
    return NextResponse.json({ error: error.message || 'Report generation failed' }, { status: 500 });
  }
}
