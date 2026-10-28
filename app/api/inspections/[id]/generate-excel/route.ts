import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateInspectionExcelReport } from '@/lib/excel-generator';
import { sbFindInspectionById, sbUpdateInspection } from '@/lib/supabase-inspections';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let inspection: any = null;

    try {
      inspection = await prisma.inspection.findUnique({
        where: { id },
        include: {
          measurements: true,
          defects: true,
          photos: true,
        },
      });
    } catch {
      inspection = await sbFindInspectionById(id);
    }

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection record not found' }, { status: 404 });
    }

    if (!inspection.inspectionNumber || String(inspection.inspectionNumber).trim() === '') {
      return NextResponse.json(
        { error: 'Inspection report number is missing. A valid permanent Report Number is required for Excel Cell B5.' },
        { status: 400 }
      );
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
      itemsToCheck: inspection.itemsToCheck ? (typeof inspection.itemsToCheck === 'string' ? JSON.parse(inspection.itemsToCheck) : inspection.itemsToCheck) : [],
      shipmentDetails: inspection.shipmentDetails ? (typeof inspection.shipmentDetails === 'string' ? JSON.parse(inspection.shipmentDetails) : inspection.shipmentDetails) : {},
      cartonDetails: inspection.cartonDetails ? (typeof inspection.cartonDetails === 'string' ? JSON.parse(inspection.cartonDetails) : inspection.cartonDetails) : [],
      capDetails: inspection.capDetails ? (typeof inspection.capDetails === 'string' ? JSON.parse(inspection.capDetails) : inspection.capDetails) : [],
      measurements: (inspection.measurements || []).map((m: any) => ({
        measurementPoint: m.measurementPoint,
        specRequired: m.specRequired,
        tolerance: m.tolerance,
        actualValues: typeof m.actualValues === 'string' ? JSON.parse(m.actualValues) : m.actualValues || [],
        result: m.result,
      })),
      defects: (inspection.defects || []).map((d: any) => ({
        defectCode: d.defectCode,
        description: d.description,
        location: d.location,
        severity: d.severity,
        quantity: d.quantity,
        photoUrl: d.photoUrl,
      })),
      currentVersion: inspection.currentVersion || 1,
      photos: (inspection.photos || []).map((p: any) => ({
        type: p.type as any,
        photoUrl: p.photoUrl,
        description: p.description,
      })),
    };

    const result = await generateInspectionExcelReport(payload);

    try {
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
    } catch {
      await sbUpdateInspection(id, {
        status: inspection.status === 'FINALIZED' ? 'FINALIZED' : 'ready_for_review',
        excelFilePath: result.relativeUrl,
      });
    }

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
