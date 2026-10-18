import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { AUDIT_SHEET_MAPPING, getPhotoBuffer, walkAndWritePhotoBlocks } from './excel-mapper';
import { convertExcelToPdf } from './pdf-converter';

export interface InspectionMeasurementData {
  measurementPoint: string;
  specRequired: string;
  tolerance: string;
  actualValues: string[];
  result: string;
}

export interface InspectionDefectData {
  defectCode: string;
  description: string;
  location: string;
  severity: string;
  quantity: number;
  photoUrl?: string;
}

export interface InspectionPhotoData {
  type: 'measurement' | 'inspection' | 'defect';
  photoUrl: string;
  description?: string;
  defectCode?: string;
  severity?: string;
}

export interface ChecklistItemData {
  id: number;
  question: string;
  status: 'YES' | 'NO' | 'N/A';
  comment: string;
}

export interface FullInspectionPayload {
  id: string;
  inspectionNumber: string;
  poNumber: string;
  poQuantity: number;
  inspectionQuantity: number;
  factoryName: string;
  agentName: string;
  season: string;
  buyerBrand: string;
  styleNumber: string;
  productDescription: string;
  inspectionDate: string;
  inspectorName: string;
  visualAuditResult: string;
  packingAuditResult: string;
  overallResult: string;
  comments: string;
  itemsToCheck?: ChecklistItemData[];
  shipmentDetails?: any;
  cartonDetails?: any[];
  capDetails?: any[];
  measurements: InspectionMeasurementData[];
  defects: InspectionDefectData[];
  photos: InspectionPhotoData[];
  currentVersion?: number;
}

import { saveFile } from './storage';

export async function generateInspectionExcelReport(
  payload: FullInspectionPayload
): Promise<{ filePath: string; relativeUrl: string; filename: string; pdfPath?: string; relativePdfUrl?: string }> {
  // Master Template MUST NEVER BE MUTATED DIRECTLY - Read template in-memory
  const masterTemplatePath = path.join(process.cwd(), 'templates', 'MPSS BLANK REPORT.xlsx');
  if (!fs.existsSync(masterTemplatePath)) {
    throw new Error(`Master template missing at ${masterTemplatePath}`);
  }

  const safePO = (payload.poNumber || 'UNKNOWN').replace(/[^a-zA-Z0-9_-]/g, '');
  const vNum = payload.currentVersion || 1;
  const filename = `MPSS_${payload.inspectionNumber}_${safePO}_V${vNum}.xlsx`;

  // Open master template directly in-memory with ExcelJS
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(masterTemplatePath);

  // -------------------------------------------------------------
  // 1. POPULATE AUDIT SHEET USING CELL MAPPING ENGINE
  // -------------------------------------------------------------
  const auditSheet = workbook.getWorksheet(AUDIT_SHEET_MAPPING.sheetName);
  if (auditSheet) {
    const fMap = AUDIT_SHEET_MAPPING.fieldMap;
    auditSheet.getCell(fMap.productDescription).value = payload.productDescription || "Men's Polo T-Shirt";
    auditSheet.getCell(fMap.agentName).value = payload.agentName || 'My Profile Sourcing Solutions';
    auditSheet.getCell(fMap.inspectionDate).value = payload.inspectionDate || new Date().toISOString().split('T')[0];

    auditSheet.getCell(fMap.inspectionNumber).value = payload.inspectionNumber || 'FI_MPSS_1313';
    auditSheet.getCell(fMap.agency).value = 'MPSS Agency';
    auditSheet.getCell(fMap.styleNumber).value = payload.styleNumber || 'YCAT0110';

    auditSheet.getCell(fMap.buyerBrand).value = payload.buyerBrand || 'CAGI';
    auditSheet.getCell(fMap.factoryName).value = payload.factoryName || 'JRP EXPORTS';
    auditSheet.getCell(fMap.poQuantity).value = Number(payload.poQuantity) || 2600;

    auditSheet.getCell(fMap.account).value = 'MENS';
    auditSheet.getCell(fMap.factoryLocation).value = 'SEYENTHAMPALAYAM';
    auditSheet.getCell(fMap.poNumber).value = payload.poNumber || '4500159665';

    auditSheet.getCell(fMap.inspectorName).value = payload.inspectorName || 'DHANAPAL';
    auditSheet.getCell(fMap.countryOfOrigin).value = 'INDIA';
    auditSheet.getCell(fMap.season).value = payload.season || 'SUMMER';

    auditSheet.getCell(fMap.colorWays).value = 'WHITE';
    auditSheet.getCell(fMap.size).value = 'M,L,XL';

    // Type matrix values
    const shipDetails = payload.shipmentDetails || {};
    auditSheet.getCell(fMap.sampleType).value = shipDetails.sampleType || 'Fit / Size Set Sample';
    auditSheet.getCell(fMap.inspectionType).value = shipDetails.inspectionType || '1st Batch | Pre-Final';
    auditSheet.getCell(fMap.totalCartons).value = `Total: ${shipDetails.totalCartons || 130}`;
    auditSheet.getCell(fMap.typeMatrixPoNumber).value = payload.poNumber || '4500159665';
    auditSheet.getCell(fMap.typeMatrixPoQty).value = Number(payload.poQuantity) || 2600;
    auditSheet.getCell(fMap.qtyShipped).value = Number(payload.poQuantity) || 2600;
    auditSheet.getCell(fMap.inspectionQuantity).value = Number(payload.inspectionQuantity) || 125;

    // AQL Data & Defect Summary
    auditSheet.getCell(fMap.inspectedQtyText).value = `Inspected Qty: ${payload.inspectionQuantity || 125}`;

    const majorCount = payload.defects ? payload.defects.filter(d => d.severity === 'Major').reduce((a, b) => a + b.quantity, 0) : 0;
    const minorCount = payload.defects ? payload.defects.filter(d => d.severity === 'Minor').reduce((a, b) => a + b.quantity, 0) : 0;
    const criticalCount = payload.defects ? payload.defects.filter(d => d.severity === 'Critical').reduce((a, b) => a + b.quantity, 0) : 0;

    auditSheet.getCell(fMap.criticalDefectsCount).value = criticalCount;
    auditSheet.getCell(fMap.majorDefectsCount).value = majorCount;
    auditSheet.getCell(fMap.minorDefectsCount).value = minorCount;

    // Result Box formatting (Write VALUES ONLY)
    if (payload.overallResult === 'PASS') {
      auditSheet.getCell('F20').value = 'PASSED: [X]';
      auditSheet.getCell('F20').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF166534' } };
      auditSheet.getCell('F20').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      auditSheet.getCell('F21').value = 'FAILED: [ ]';
      auditSheet.getCell('F22').value = 'PENDING: [ ]';
    } else if (payload.overallResult === 'FAIL') {
      auditSheet.getCell('F20').value = 'PASSED: [ ]';
      auditSheet.getCell('F21').value = 'FAILED: [X]';
      auditSheet.getCell('F21').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
      auditSheet.getCell('F21').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      auditSheet.getCell('F22').value = 'PENDING: [ ]';
    } else {
      auditSheet.getCell('F20').value = 'PASSED: [ ]';
      auditSheet.getCell('F21').value = 'FAILED: [ ]';
      auditSheet.getCell('F22').value = 'PENDING: [X]';
      auditSheet.getCell('F22').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } };
      auditSheet.getCell('F22').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    }

    auditSheet.getCell(fMap.overallComments).value = payload.comments || 'Inspection completed. All parameters verified.';

    // Populate Checklist Items (22 questions)
    if (payload.itemsToCheck && payload.itemsToCheck.length > 0) {
      payload.itemsToCheck.forEach((item, idx) => {
        const r = 28 + idx;
        auditSheet.getCell(`E${r}`).value = `${item.status || 'YES'} [X]`;
        if (item.comment) {
          auditSheet.getCell(`F${r}`).value = item.comment;
        }
      });
    }
  }

  // -------------------------------------------------------------
  // 2. POPULATE MEASURE SHEET
  // -------------------------------------------------------------
  const measureSheet = workbook.getWorksheet('MEASURE');
  if (measureSheet && payload.measurements && payload.measurements.length > 0) {
    payload.measurements.forEach((m, idx) => {
      const rowIndex = 5 + idx;
      const row = measureSheet.getRow(rowIndex);
      row.getCell(1).value = m.measurementPoint;
      row.getCell(2).value = 'L';
      row.getCell(3).value = m.specRequired;
      row.getCell(4).value = m.tolerance;

      if (Array.isArray(m.actualValues)) {
        m.actualValues.forEach((val, sIdx) => {
          if (sIdx < 5) {
            row.getCell(5 + sIdx).value = val;
          }
        });
      }

      const resCell = row.getCell(10);
      resCell.value = m.result || 'PASS';
      resCell.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: m.result === 'FAIL' ? 'FFDC2626' : 'FF166534' },
      };
    });

    const measurePhotoData = payload.photos ? payload.photos.find((p) => p.type === 'measurement') : undefined;
    if (measurePhotoData) {
      const imgInfo = await getPhotoBuffer(measurePhotoData.photoUrl);
      if (imgInfo) {
        const imageId = workbook.addImage({
          buffer: imgInfo.buffer as any,
          extension: imgInfo.extension,
        });
        measureSheet.addImage(imageId, {
          tl: { col: 0, row: 14 },
          br: { col: 9, row: 30 },
          editAs: 'oneCell',
        } as any);
      }
    }
  }

  // -------------------------------------------------------------
  // 3. POPULATE DEFECTS PHOTOS SHEET (Dynamic Repeating Block Walker)
  // -------------------------------------------------------------
  const defectPhotos = (payload.photos || []).filter((p) => p.type === 'defect' || p.defectCode);
  if (defectPhotos.length > 0) {
    await walkAndWritePhotoBlocks(workbook, 'Defects photos', defectPhotos);
  }

  // -------------------------------------------------------------
  // 4. POPULATE INSPECTION PHOTOS SHEET (Dynamic Repeating Block Walker)
  // -------------------------------------------------------------
  const genInspectionPhotos = (payload.photos || []).filter((p) => p.type === 'inspection');
  if (genInspectionPhotos.length > 0) {
    await walkAndWritePhotoBlocks(workbook, 'Inspection photos', genInspectionPhotos);
  }

  // Generate Excel workbook buffer in-memory
  const excelBuffer = Buffer.from(await workbook.xlsx.writeBuffer());

  // Save generated Excel workbook to persistent storage
  const savedReport = await saveFile(`reports/${filename}`, excelBuffer, {
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  return {
    filePath: savedReport.pathname,
    relativeUrl: savedReport.url,
    filename,
  };
}
