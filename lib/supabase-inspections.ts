import crypto from 'crypto';

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://yrnxfncmmmrfowvckdjg.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  return { supabaseUrl, anonKey };
}

function getHeaders() {
  const { anonKey } = getSupabaseConfig();
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  };
}

export function sbGenerateId(): string {
  return 'c' + crypto.randomBytes(12).toString('hex');
}

export async function sbFindInspectionById(id: string): Promise<any | null> {
  const { supabaseUrl } = getSupabaseConfig();
  const res = await fetch(`${supabaseUrl}/rest/v1/Inspection?id=eq.${encodeURIComponent(id)}&limit=1`, {
    headers: getHeaders(),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.length === 0) return null;
  const inspection = data[0];

  // Also fetch related measurements, defects, photos
  const [measRes, defRes, phoRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/InspectionMeasurement?inspectionId=eq.${encodeURIComponent(id)}`, { headers: getHeaders() }),
    fetch(`${supabaseUrl}/rest/v1/InspectionDefect?inspectionId=eq.${encodeURIComponent(id)}`, { headers: getHeaders() }),
    fetch(`${supabaseUrl}/rest/v1/InspectionPhoto?inspectionId=eq.${encodeURIComponent(id)}`, { headers: getHeaders() }),
  ]);

  inspection.measurements = measRes.ok ? await measRes.json() : [];
  inspection.defects = defRes.ok ? await defRes.json() : [];
  inspection.photos = phoRes.ok ? await phoRes.json() : [];
  inspection.versions = [];
  inspection.auditLogs = [];

  return inspection;
}

export async function sbFindInspectionByNumber(inspectionNumber: string): Promise<any | null> {
  const { supabaseUrl } = getSupabaseConfig();
  const res = await fetch(`${supabaseUrl}/rest/v1/Inspection?inspectionNumber=eq.${encodeURIComponent(inspectionNumber)}&limit=1`, {
    headers: getHeaders(),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data && data.length > 0 ? data[0] : null;
}

export async function sbListInspections(status?: string): Promise<any[]> {
  const { supabaseUrl } = getSupabaseConfig();
  let url = `${supabaseUrl}/rest/v1/Inspection?select=*&order=createdAt.desc`;
  if (status && status !== 'all') {
    if (status === 'draft') {
      url += `&status=neq.FINALIZED`;
    } else {
      url += `&status=eq.${encodeURIComponent(status)}`;
    }
  }
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function sbCreateInspection(data: any): Promise<any> {
  const { supabaseUrl } = getSupabaseConfig();
  const id = data.id || sbGenerateId();
  const now = new Date().toISOString();

  const insertPayload = {
    id,
    inspectionNumber: data.inspectionNumber,
    poNumber: data.poNumber ?? '',
    poQuantity: Number(data.poQuantity) || 0,
    inspectionQuantity: Number(data.inspectionQuantity) || 0,
    factoryName: data.factoryName ?? '',
    agentName: data.agentName ?? '',
    season: data.season ?? '',
    buyerBrand: data.buyerBrand ?? '',
    styleNumber: data.styleNumber ?? '',
    productDescription: data.productDescription ?? '',
    inspectionDate: data.inspectionDate || now.split('T')[0],
    inspectorName: data.inspectorName ?? '',
    visualAuditResult: data.visualAuditResult ?? 'PASS',
    packingAuditResult: data.packingAuditResult ?? 'PASS',
    overallResult: data.overallResult ?? 'PASS',
    comments: data.comments ?? '',
    itemsToCheck: typeof data.itemsToCheck === 'string' ? data.itemsToCheck : JSON.stringify(data.itemsToCheck || []),
    shipmentDetails: typeof data.shipmentDetails === 'string' ? data.shipmentDetails : JSON.stringify(data.shipmentDetails || {}),
    cartonDetails: typeof data.cartonDetails === 'string' ? data.cartonDetails : JSON.stringify(data.cartonDetails || []),
    capDetails: typeof data.capDetails === 'string' ? data.capDetails : JSON.stringify(data.capDetails || []),
    status: data.status || 'draft',
    currentVersion: data.currentVersion || 1,
    finalizedAt: data.finalizedAt || null,
    finalizedBy: data.finalizedBy || '',
    excelFilePath: data.excelFilePath || '',
    driveUrl: data.driveUrl || '',
    updatedAt: now,
  };

  const res = await fetch(`${supabaseUrl}/rest/v1/Inspection`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(insertPayload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (err.code === '23505') {
      const pError: any = new Error('Unique constraint failed on the fields: (`inspectionNumber`)');
      pError.code = 'P2002';
      throw pError;
    }
    throw new Error(err.message || `Failed to create inspection draft (HTTP ${res.status})`);
  }

  const createdRows = await res.json();
  const record = createdRows[0];
  record.measurements = [];
  record.defects = [];
  record.photos = [];
  record.versions = [];
  record.auditLogs = [];
  return record;
}

export async function sbUpdateInspection(id: string, data: any): Promise<any> {
  const { supabaseUrl } = getSupabaseConfig();
  const now = new Date().toISOString();

  // Strip relations
  const {
    measurements,
    defects,
    photos,
    versions,
    auditLogs,
    ...cleanData
  } = data;

  cleanData.updatedAt = now;

  const res = await fetch(`${supabaseUrl}/rest/v1/Inspection?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      ...getHeaders(),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(cleanData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update inspection draft (HTTP ${res.status})`);
  }

  const updatedRows = await res.json();
  return updatedRows[0] || null;
}
