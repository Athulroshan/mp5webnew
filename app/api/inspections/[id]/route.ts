import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        measurements: true,
        defects: true,
        photos: true,
        versions: { orderBy: { versionNumber: 'desc' } },
        auditLogs: { orderBy: { timestamp: 'desc' } },
      },
    });

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    const formattedMeasurements = inspection.measurements.map((m) => ({
      ...m,
      actualValues: m.actualValues ? JSON.parse(m.actualValues) : [],
    }));

    return NextResponse.json({
      inspection: {
        ...inspection,
        measurements: formattedMeasurements,
        itemsToCheck: inspection.itemsToCheck ? JSON.parse(inspection.itemsToCheck) : [],
        shipmentDetails: inspection.shipmentDetails ? JSON.parse(inspection.shipmentDetails) : {},
        cartonDetails: inspection.cartonDetails ? JSON.parse(inspection.cartonDetails) : [],
        capDetails: inspection.capDetails ? JSON.parse(inspection.capDetails) : [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching inspection:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch inspection' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Check if record exists
    const existing = await prisma.inspection.findUnique({ where: { id } });
    if (!existing) {
      console.error(`[BACKEND VALIDATION ERROR] Update rejected: Inspection ID ${id} not found.`);
      return NextResponse.json(
        { error: `Inspection ID '${id}' not found. Cannot update non-existent draft.`, rejectedFields: ['id'] },
        { status: 404 }
      );
    }

    const {
      poNumber,
      poQuantity,
      inspectionQuantity,
      factoryName,
      agentName,
      season,
      buyerBrand,
      styleNumber,
      productDescription,
      inspectionDate,
      inspectorName,
      visualAuditResult,
      packingAuditResult,
      overallResult,
      comments,
      itemsToCheck = [],
      shipmentDetails = {},
      cartonDetails = [],
      capDetails = [],
      measurements = [],
      defects = [],
      photos = [],
      status = 'draft',
      currentVersion,
    } = body;

    // Validate essential fields
    const missingFields: string[] = [];
    if (!poNumber && poNumber !== '') missingFields.push('poNumber');
    if (!factoryName && factoryName !== '') missingFields.push('factoryName');
    
    if (missingFields.length > 0) {
      console.error('[BACKEND VALIDATION ERROR] Rejected update payload missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Validation failed. Missing required fields: ${missingFields.join(', ')}`, rejectedFields: missingFields },
        { status: 400 }
      );
    }

    const updated = await prisma.inspection.update({
      where: { id },
      data: {
        poNumber: poNumber ?? existing.poNumber,
        poQuantity: poQuantity !== undefined ? Number(poQuantity) : existing.poQuantity,
        inspectionQuantity: inspectionQuantity !== undefined ? Number(inspectionQuantity) : existing.inspectionQuantity,
        factoryName: factoryName ?? existing.factoryName,
        agentName: agentName ?? existing.agentName,
        season: season ?? existing.season,
        buyerBrand: buyerBrand ?? existing.buyerBrand,
        styleNumber: styleNumber ?? existing.styleNumber,
        productDescription: productDescription ?? existing.productDescription,
        inspectionDate: inspectionDate ?? existing.inspectionDate,
        inspectorName: inspectorName ?? existing.inspectorName,
        visualAuditResult: visualAuditResult ?? existing.visualAuditResult,
        packingAuditResult: packingAuditResult ?? existing.packingAuditResult,
        overallResult: overallResult ?? existing.overallResult,
        comments: comments ?? existing.comments,
        itemsToCheck: JSON.stringify(itemsToCheck),
        shipmentDetails: JSON.stringify(shipmentDetails),
        cartonDetails: JSON.stringify(cartonDetails),
        capDetails: JSON.stringify(capDetails),
        status: status ?? existing.status,
        currentVersion: currentVersion ?? existing.currentVersion,
      },
    });

    // Update child tables
    await prisma.inspectionMeasurement.deleteMany({ where: { inspectionId: id } });
    await prisma.inspectionDefect.deleteMany({ where: { inspectionId: id } });
    await prisma.inspectionPhoto.deleteMany({ where: { inspectionId: id } });

    if (measurements.length > 0) {
      await prisma.inspectionMeasurement.createMany({
        data: measurements.map((m: any) => ({
          inspectionId: id,
          measurementPoint: m.measurementPoint,
          specRequired: m.specRequired || '',
          tolerance: m.tolerance || '',
          actualValues: JSON.stringify(m.actualValues || []),
          result: m.result || 'PASS',
        })),
      });
    }

    if (defects.length > 0) {
      await prisma.inspectionDefect.createMany({
        data: defects.map((d: any) => ({
          inspectionId: id,
          defectCode: d.defectCode,
          description: d.description || '',
          location: d.location || '',
          severity: d.severity || 'Major',
          quantity: Number(d.quantity) || 1,
          photoUrl: d.photoUrl || '',
        })),
      });
    }

    if (photos.length > 0) {
      await prisma.inspectionPhoto.createMany({
        data: photos.map((p: any) => ({
          inspectionId: id,
          type: p.type || 'inspection',
          photoUrl: p.photoUrl,
          description: p.description || '',
        })),
      });
    }

    await prisma.inspectionAuditLog.create({
      data: {
        inspectionId: id,
        versionNumber: updated.currentVersion,
        action: 'DRAFT_UPDATED',
        performedByName: inspectorName || 'QA Auditor',
        details: `Autosaved draft update for PO: ${poNumber || existing.poNumber}`,
      },
    });

    const fullRecord = await prisma.inspection.findUnique({
      where: { id },
      include: {
        measurements: true,
        defects: true,
        photos: true,
        versions: { orderBy: { versionNumber: 'desc' } },
        auditLogs: { orderBy: { timestamp: 'desc' } },
      },
    });

    return NextResponse.json({ success: true, inspection: fullRecord });
  } catch (error: any) {
    console.error('[BACKEND ERROR] Error updating inspection draft:', error);
    return NextResponse.json({ error: error.message || 'Failed to update inspection draft' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.inspection.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Inspection deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting inspection:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete inspection' }, { status: 500 });
  }
}
