import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateInspectionNumber(): Promise<string> {
  const year = new Date().getFullYear();
  let count = await prisma.inspection.count();
  let nextNum = count + 1;
  let candidate = `INS-${year}-${nextNum.toString().padStart(5, '0')}`;
  while (await prisma.inspection.findUnique({ where: { inspectionNumber: candidate } })) {
    nextNum++;
    candidate = `INS-${year}-${nextNum.toString().padStart(5, '0')}`;
  }
  return candidate;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const inspections = await prisma.inspection.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: {
        measurements: true,
        defects: true,
        photos: true,
        versions: { orderBy: { versionNumber: 'desc' } },
        auditLogs: { orderBy: { timestamp: 'desc' } },
      },
    });

    return NextResponse.json({ inspections });
  } catch (error: any) {
    console.error('Error fetching inspections:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch inspections' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
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
      currentVersion = 1,
    } = body;

    // Validate fields
    const missingFields: string[] = [];
    if (poNumber === undefined || poNumber === null) missingFields.push('poNumber');
    if (factoryName === undefined || factoryName === null) missingFields.push('factoryName');

    if (missingFields.length > 0) {
      console.error('[BACKEND VALIDATION ERROR] Draft save rejected missing fields:', missingFields);
      return NextResponse.json(
        {
          error: `Validation failed: Required field(s) [${missingFields.join(', ')}] missing.`,
          rejectedFields: missingFields,
        },
        { status: 400 }
      );
    }

    let inspection;

    if (id) {
      // Check if existing record exists
      const existing = await prisma.inspection.findUnique({ where: { id } });
      if (!existing) {
        console.error(`[BACKEND VALIDATION ERROR] Update failed. Inspection ID '${id}' not found in DB.`);
        return NextResponse.json({ error: `Inspection draft '${id}' not found.` }, { status: 404 });
      }

      inspection = await prisma.inspection.update({
        where: { id },
        data: {
          poNumber: poNumber || '',
          poQuantity: Number(poQuantity) || 0,
          inspectionQuantity: Number(inspectionQuantity) || 0,
          factoryName: factoryName || '',
          agentName: agentName || '',
          season: season || '',
          buyerBrand: buyerBrand || '',
          styleNumber: styleNumber || '',
          productDescription: productDescription || '',
          inspectionDate: inspectionDate || new Date().toISOString().split('T')[0],
          inspectorName: inspectorName || '',
          visualAuditResult: visualAuditResult || 'PASS',
          packingAuditResult: packingAuditResult || 'PASS',
          overallResult: overallResult || 'PASS',
          comments: comments || '',
          itemsToCheck: JSON.stringify(itemsToCheck),
          shipmentDetails: JSON.stringify(shipmentDetails),
          cartonDetails: JSON.stringify(cartonDetails),
          capDetails: JSON.stringify(capDetails),
          status,
          currentVersion,
        },
      });

      await prisma.inspectionMeasurement.deleteMany({ where: { inspectionId: id } });
      await prisma.inspectionDefect.deleteMany({ where: { inspectionId: id } });
      await prisma.inspectionPhoto.deleteMany({ where: { inspectionId: id } });

      await prisma.inspectionAuditLog.create({
        data: {
          inspectionId: id,
          versionNumber: currentVersion,
          action: 'DRAFT_UPDATED',
          performedByName: inspectorName || 'QA Auditor',
          details: `Updated draft details for PO: ${poNumber || 'N/A'}`,
        },
      });
    } else {
      // Create fresh ONCE
      const inspectionNumber = await generateInspectionNumber();
      console.log(`[BACKEND ACTION] Creating new inspection draft with unique inspectionNumber: ${inspectionNumber}`);
      inspection = await prisma.inspection.create({
        data: {
          inspectionNumber,
          poNumber: poNumber || '',
          poQuantity: Number(poQuantity) || 0,
          inspectionQuantity: Number(inspectionQuantity) || 0,
          factoryName: factoryName || '',
          agentName: agentName || '',
          season: season || '',
          buyerBrand: buyerBrand || '',
          styleNumber: styleNumber || '',
          productDescription: productDescription || '',
          inspectionDate: inspectionDate || new Date().toISOString().split('T')[0],
          inspectorName: inspectorName || '',
          visualAuditResult: visualAuditResult || 'PASS',
          packingAuditResult: packingAuditResult || 'PASS',
          overallResult: overallResult || 'PASS',
          comments: comments || '',
          itemsToCheck: JSON.stringify(itemsToCheck),
          shipmentDetails: JSON.stringify(shipmentDetails),
          cartonDetails: JSON.stringify(cartonDetails),
          capDetails: JSON.stringify(capDetails),
          status,
          currentVersion: 1,
        },
      });

      await prisma.inspectionAuditLog.create({
        data: {
          inspectionId: inspection.id,
          versionNumber: 1,
          action: 'CREATED',
          performedByName: inspectorName || 'QA Auditor',
          details: `Created new inspection record ${inspectionNumber}`,
        },
      });
    }

    const currentId = inspection.id;

    if (measurements.length > 0) {
      await prisma.inspectionMeasurement.createMany({
        data: measurements.map((m: any) => ({
          inspectionId: currentId,
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
          inspectionId: currentId,
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
          inspectionId: currentId,
          type: p.type || 'inspection',
          photoUrl: p.photoUrl,
          description: p.description || '',
        })),
      });
    }

    const updatedRecord = await prisma.inspection.findUnique({
      where: { id: currentId },
      include: {
        measurements: true,
        defects: true,
        photos: true,
        versions: { orderBy: { versionNumber: 'desc' } },
        auditLogs: { orderBy: { timestamp: 'desc' } },
      },
    });

    return NextResponse.json({ success: true, inspection: updatedRecord });
  } catch (error: any) {
    console.error('[BACKEND ERROR] Error saving inspection:', error);
    return NextResponse.json({ error: error.message || 'Failed to save inspection' }, { status: 500 });
  }
}
