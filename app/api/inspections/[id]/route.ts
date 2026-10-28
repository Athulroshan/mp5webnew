import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  sbFindInspectionById,
  sbFindInspectionByNumber,
  sbUpdateInspection,
} from '@/lib/supabase-inspections';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
          versions: { orderBy: { versionNumber: 'desc' } },
          auditLogs: { orderBy: { timestamp: 'desc' } },
        },
      });
    } catch {
      inspection = await sbFindInspectionById(id);
    }

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
    }

    const formattedMeasurements = (inspection.measurements || []).map((m: any) => ({
      ...m,
      actualValues: typeof m.actualValues === 'string' ? JSON.parse(m.actualValues) : m.actualValues || [],
    }));

    return NextResponse.json({
      inspection: {
        ...inspection,
        measurements: formattedMeasurements,
        itemsToCheck: typeof inspection.itemsToCheck === 'string' ? JSON.parse(inspection.itemsToCheck || '[]') : inspection.itemsToCheck || [],
        shipmentDetails: typeof inspection.shipmentDetails === 'string' ? JSON.parse(inspection.shipmentDetails || '{}') : inspection.shipmentDetails || {},
        cartonDetails: typeof inspection.cartonDetails === 'string' ? JSON.parse(inspection.cartonDetails || '[]') : inspection.cartonDetails || [],
        capDetails: typeof inspection.capDetails === 'string' ? JSON.parse(inspection.capDetails || '[]') : inspection.capDetails || [],
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

    let existing: any = null;
    try {
      existing = await prisma.inspection.findUnique({ where: { id } });
    } catch {
      existing = await sbFindInspectionById(id);
    }

    if (!existing) {
      console.warn(`[BACKEND NOTICE] Inspection ID ${id} not found in DB during PATCH; redirecting to POST handler.`);
      const createRes = await fetch(new URL('/api/inspections', req.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, id }),
      });
      const data = await createRes.json();
      return NextResponse.json(data, { status: createRes.status });
    }

    const {
      inspectionNumber,
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

    // If user updated the Report Number, validate uniqueness across other reports
    let finalInspectionNumber = existing.inspectionNumber;
    if (
      inspectionNumber !== undefined &&
      String(inspectionNumber).trim() !== '' &&
      String(inspectionNumber).trim() !== existing.inspectionNumber
    ) {
      const candidate = String(inspectionNumber).trim();
      let conflict: any = null;
      try {
        conflict = await prisma.inspection.findFirst({
          where: { inspectionNumber: candidate, NOT: { id } },
        });
      } catch {
        conflict = await sbFindInspectionByNumber(candidate);
        if (conflict && conflict.id === id) conflict = null;
      }

      if (conflict) {
        return NextResponse.json(
          { error: `Report Number "${candidate}" is already in use by another inspection report.` },
          { status: 409 }
        );
      }
      finalInspectionNumber = candidate;
    }

    const updatePayload = {
      inspectionNumber: finalInspectionNumber,
      poNumber: poNumber !== undefined ? String(poNumber) : existing.poNumber,
      poQuantity: poQuantity !== undefined ? Number(poQuantity) : existing.poQuantity,
      inspectionQuantity: inspectionQuantity !== undefined ? Number(inspectionQuantity) : existing.inspectionQuantity,
      factoryName: factoryName !== undefined ? String(factoryName) : existing.factoryName,
      agentName: agentName !== undefined ? String(agentName) : existing.agentName,
      season: season !== undefined ? String(season) : existing.season,
      buyerBrand: buyerBrand !== undefined ? String(buyerBrand) : existing.buyerBrand,
      styleNumber: styleNumber !== undefined ? String(styleNumber) : existing.styleNumber,
      productDescription: productDescription !== undefined ? String(productDescription) : existing.productDescription,
      inspectionDate: inspectionDate !== undefined ? String(inspectionDate) : existing.inspectionDate,
      inspectorName: inspectorName !== undefined ? String(inspectorName) : existing.inspectorName,
      visualAuditResult: visualAuditResult ?? existing.visualAuditResult,
      packingAuditResult: packingAuditResult ?? existing.packingAuditResult,
      overallResult: overallResult ?? existing.overallResult,
      comments: comments !== undefined ? String(comments) : existing.comments,
      itemsToCheck: itemsToCheck ? (typeof itemsToCheck === 'string' ? itemsToCheck : JSON.stringify(itemsToCheck)) : existing.itemsToCheck,
      shipmentDetails: shipmentDetails ? (typeof shipmentDetails === 'string' ? shipmentDetails : JSON.stringify(shipmentDetails)) : existing.shipmentDetails,
      cartonDetails: cartonDetails ? (typeof cartonDetails === 'string' ? cartonDetails : JSON.stringify(cartonDetails)) : existing.cartonDetails,
      capDetails: capDetails ? (typeof capDetails === 'string' ? capDetails : JSON.stringify(capDetails)) : existing.capDetails,
      status: status || existing.status,
      currentVersion: currentVersion !== undefined ? Number(currentVersion) : existing.currentVersion,
    };

    let updated: any = null;
    try {
      updated = await prisma.inspection.update({
        where: { id },
        data: updatePayload,
      });
    } catch {
      updated = await sbUpdateInspection(id, updatePayload);
    }

    // Relationships sync safely
    try {
      if (measurements && measurements.length > 0) {
        await prisma.inspectionMeasurement.deleteMany({ where: { inspectionId: id } });
        await prisma.inspectionMeasurement.createMany({
          data: measurements.map((m: any) => ({
            inspectionId: id,
            measurementPoint: m.measurementPoint || '',
            specRequired: m.specRequired || '',
            tolerance: m.tolerance || '',
            actualValues: typeof m.actualValues === 'string' ? m.actualValues : JSON.stringify(m.actualValues || []),
            result: m.result || 'PASS',
          })),
        });
      }

      if (defects && defects.length > 0) {
        await prisma.inspectionDefect.deleteMany({ where: { inspectionId: id } });
        await prisma.inspectionDefect.createMany({
          data: defects.map((d: any) => ({
            inspectionId: id,
            defectCode: d.defectCode || '',
            description: d.description || '',
            location: d.location || '',
            severity: d.severity || 'Major',
            quantity: Number(d.quantity) || 1,
            photoUrl: d.photoUrl || '',
          })),
        });
      }

      if (photos && photos.length > 0) {
        await prisma.inspectionPhoto.deleteMany({ where: { inspectionId: id } });
        await prisma.inspectionPhoto.createMany({
          data: photos.map((p: any) => ({
            inspectionId: id,
            type: p.type || 'inspection',
            photoUrl: p.photoUrl || '',
            description: p.description || '',
          })),
        });
      }

      await prisma.inspectionAuditLog.create({
        data: {
          inspectionId: id,
          versionNumber: updated?.currentVersion || 1,
          action: 'DRAFT_UPDATED',
          performedByName: inspectorName || 'QA Auditor',
          details: `Autosaved draft update for PO: ${poNumber || existing.poNumber}`,
        },
      });
    } catch {
      // fallback ignore relationship sync error
    }

    let fullRecord: any = null;
    try {
      fullRecord = await prisma.inspection.findUnique({
        where: { id },
        include: {
          measurements: true,
          defects: true,
          photos: true,
          versions: { orderBy: { versionNumber: 'desc' } },
          auditLogs: { orderBy: { timestamp: 'desc' } },
        },
      });
    } catch {
      fullRecord = await sbFindInspectionById(id);
    }

    return NextResponse.json({ success: true, inspection: fullRecord || updated || existing });
  } catch (error: any) {
    console.error('[BACKEND ERROR] Error updating inspection draft:', error);
    return NextResponse.json({ error: error.message || 'Failed to update inspection draft' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    try {
      await prisma.inspection.delete({ where: { id } });
    } catch {
      // Supabase REST delete
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
      if (supabaseUrl && anonKey) {
        await fetch(`${supabaseUrl}/rest/v1/Inspection?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        });
      }
    }
    return NextResponse.json({ success: true, message: 'Inspection deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting inspection:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete inspection' }, { status: 500 });
  }
}

export const PUT = PATCH;
