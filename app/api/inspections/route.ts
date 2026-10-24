import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Generate inspection number once on creation.
 * Format: FI_MPSS_#### with an incrementing 4-digit counter.
 * Once assigned, it is never changed on autosaves or updates.
 */
async function generateInspectionNumber(): Promise<string> {
  const existing = await prisma.inspection.findMany({
    select: { inspectionNumber: true },
  });

  let maxNum = 0;
  for (const item of existing) {
    const match = item.inspectionNumber?.match(/^FI_MPSS_(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  // If no FI_MPSS_ records found, base initial counter on total existing inspections
  if (maxNum === 0) {
    maxNum = existing.length;
  }

  let nextNum = maxNum + 1;
  let candidate = `FI_MPSS_${nextNum.toString().padStart(4, '0')}`;
  while (await prisma.inspection.findUnique({ where: { inspectionNumber: candidate } })) {
    nextNum++;
    candidate = `FI_MPSS_${nextNum.toString().padStart(4, '0')}`;
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
      inspectionNumber: providedInspectionNumber,
      poNumber = '',
      poQuantity = 0,
      inspectionQuantity = 0,
      factoryName = '',
      agentName = '',
      season = '',
      buyerBrand = '',
      styleNumber = '',
      productDescription = '',
      inspectionDate = new Date().toISOString().split('T')[0],
      inspectorName = '',
      visualAuditResult = 'PASS',
      packingAuditResult = 'PASS',
      overallResult = 'PASS',
      comments = '',
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

    let inspection;

    if (id) {
      // Check if existing record exists
      const existing = await prisma.inspection.findUnique({ where: { id } });
      if (existing) {
        // Update existing draft. CRITICAL: Never regenerate inspectionNumber on update!
        inspection = await prisma.inspection.update({
          where: { id },
          data: {
            poNumber: poNumber ?? '',
            poQuantity: Number(poQuantity) || 0,
            inspectionQuantity: Number(inspectionQuantity) || 0,
            factoryName: factoryName ?? '',
            agentName: agentName ?? '',
            season: season ?? '',
            buyerBrand: buyerBrand ?? '',
            styleNumber: styleNumber ?? '',
            productDescription: productDescription ?? '',
            inspectionDate: inspectionDate || new Date().toISOString().split('T')[0],
            inspectorName: inspectorName ?? '',
            visualAuditResult: visualAuditResult ?? 'PASS',
            packingAuditResult: packingAuditResult ?? 'PASS',
            overallResult: overallResult ?? 'PASS',
            comments: comments ?? '',
            itemsToCheck: typeof itemsToCheck === 'string' ? itemsToCheck : JSON.stringify(itemsToCheck),
            shipmentDetails: typeof shipmentDetails === 'string' ? shipmentDetails : JSON.stringify(shipmentDetails),
            cartonDetails: typeof cartonDetails === 'string' ? cartonDetails : JSON.stringify(cartonDetails),
            capDetails: typeof capDetails === 'string' ? capDetails : JSON.stringify(capDetails),
            status: status || existing.status,
            currentVersion: Number(currentVersion) || existing.currentVersion,
          },
        });

        await prisma.inspectionAuditLog.create({
          data: {
            inspectionId: id,
            versionNumber: inspection.currentVersion,
            action: 'DRAFT_UPDATED',
            performedByName: inspectorName || 'QA Auditor',
            details: `Updated draft details for PO: ${poNumber || 'N/A'}`,
          },
        });
      } else {
        // ID provided but not found: create record with this ID and generate inspectionNumber ONCE
        const inspectionNumber = providedInspectionNumber || (await generateInspectionNumber());
        inspection = await prisma.inspection.create({
          data: {
            id,
            inspectionNumber,
            poNumber: poNumber ?? '',
            poQuantity: Number(poQuantity) || 0,
            inspectionQuantity: Number(inspectionQuantity) || 0,
            factoryName: factoryName ?? '',
            agentName: agentName ?? '',
            season: season ?? '',
            buyerBrand: buyerBrand ?? '',
            styleNumber: styleNumber ?? '',
            productDescription: productDescription ?? '',
            inspectionDate: inspectionDate || new Date().toISOString().split('T')[0],
            inspectorName: inspectorName ?? '',
            visualAuditResult: visualAuditResult ?? 'PASS',
            packingAuditResult: packingAuditResult ?? 'PASS',
            overallResult: overallResult ?? 'PASS',
            comments: comments ?? '',
            itemsToCheck: typeof itemsToCheck === 'string' ? itemsToCheck : JSON.stringify(itemsToCheck),
            shipmentDetails: typeof shipmentDetails === 'string' ? shipmentDetails : JSON.stringify(shipmentDetails),
            cartonDetails: typeof cartonDetails === 'string' ? cartonDetails : JSON.stringify(cartonDetails),
            capDetails: typeof capDetails === 'string' ? capDetails : JSON.stringify(capDetails),
            status: status || 'draft',
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
    } else {
      // First-time creation: generate inspectionNumber ONCE
      const inspectionNumber = providedInspectionNumber || (await generateInspectionNumber());
      console.log(`[BACKEND ACTION] Creating new inspection draft with permanent report number: ${inspectionNumber}`);
      inspection = await prisma.inspection.create({
        data: {
          inspectionNumber,
          poNumber: poNumber ?? '',
          poQuantity: Number(poQuantity) || 0,
          inspectionQuantity: Number(inspectionQuantity) || 0,
          factoryName: factoryName ?? '',
          agentName: agentName ?? '',
          season: season ?? '',
          buyerBrand: buyerBrand ?? '',
          styleNumber: styleNumber ?? '',
          productDescription: productDescription ?? '',
          inspectionDate: inspectionDate || new Date().toISOString().split('T')[0],
          inspectorName: inspectorName ?? '',
          visualAuditResult: visualAuditResult ?? 'PASS',
          packingAuditResult: packingAuditResult ?? 'PASS',
          overallResult: overallResult ?? 'PASS',
          comments: comments ?? '',
          itemsToCheck: typeof itemsToCheck === 'string' ? itemsToCheck : JSON.stringify(itemsToCheck),
          shipmentDetails: typeof shipmentDetails === 'string' ? shipmentDetails : JSON.stringify(shipmentDetails),
          cartonDetails: typeof cartonDetails === 'string' ? cartonDetails : JSON.stringify(cartonDetails),
          capDetails: typeof capDetails === 'string' ? capDetails : JSON.stringify(capDetails),
          status: status || 'draft',
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

    // Synchronize nested relationships
    await prisma.inspectionMeasurement.deleteMany({ where: { inspectionId: currentId } });
    if (measurements.length > 0) {
      await prisma.inspectionMeasurement.createMany({
        data: measurements.map((m: any) => ({
          inspectionId: currentId,
          measurementPoint: m.measurementPoint || '',
          specRequired: m.specRequired || '',
          tolerance: m.tolerance || '',
          actualValues: typeof m.actualValues === 'string' ? m.actualValues : JSON.stringify(m.actualValues || []),
          result: m.result || 'PASS',
        })),
      });
    }

    await prisma.inspectionDefect.deleteMany({ where: { inspectionId: currentId } });
    if (defects.length > 0) {
      await prisma.inspectionDefect.createMany({
        data: defects.map((d: any) => ({
          inspectionId: currentId,
          defectCode: d.defectCode || '',
          description: d.description || '',
          location: d.location || '',
          severity: d.severity || 'Major',
          quantity: Number(d.quantity) || 1,
          photoUrl: d.photoUrl || '',
        })),
      });
    }

    await prisma.inspectionPhoto.deleteMany({ where: { inspectionId: currentId } });
    if (photos.length > 0) {
      await prisma.inspectionPhoto.createMany({
        data: photos.map((p: any) => ({
          inspectionId: currentId,
          type: p.type || 'inspection',
          photoUrl: p.photoUrl || '',
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
