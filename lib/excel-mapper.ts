import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

// JSON Mapping Configuration Schema per Sheet
export interface SheetMappingConfig {
  sheetName: string;
  fieldMap: Record<string, string>; // formFieldName -> cellCoordinate
}

export const AUDIT_SHEET_MAPPING: SheetMappingConfig = {
  sheetName: 'Audit',
  fieldMap: {
    productDescription: 'B4',
    agentName: 'F4',
    inspectionDate: 'I4',
    inspectionNumber: 'B5',
    agency: 'D5',
    styleNumber: 'F5',
    buyerBrand: 'B6',
    factoryName: 'D6',
    poQuantity: 'F6',
    account: 'B7',
    factoryLocation: 'D7',
    poNumber: 'F7',
    inspectorName: 'B8',
    countryOfOrigin: 'D8',
    season: 'F8',
    colorWays: 'E9',
    size: 'E10',
    // Type Matrix
    sampleType: 'A14',
    inspectionType: 'B14',
    orderType: 'C14',
    totalCartons: 'D14',
    shipBy: 'E14',
    typeMatrixPoNumber: 'F14',
    typeMatrixPoQty: 'G14',
    qtyShipped: 'H14',
    inspectionQuantity: 'I14',
    destination: 'J14',
    // AQL Data
    inspectedQtyText: 'C20',
    criticalDefectsCount: 'E23',
    majorDefectsCount: 'E24',
    minorDefectsCount: 'E25',
    overallComments: 'G20',
  },
};

export const MEASURE_SHEET_MAPPING: SheetMappingConfig = {
  sheetName: 'MEASURE',
  fieldMap: {
    startRow: '5',
    colMeasurementPoint: '1',
    colSize: '2',
    colSpec: '3',
    colTolerance: '4',
    colValuesStart: '5', // E-I (cols 5-9)
    colResult: '10',    // J
  },
};

// Function to resolve photo buffer from URL or Base64 data string
export function getPhotoBuffer(photoUrl: string): { buffer: Buffer; extension: 'jpeg' | 'png' | 'gif' } | null {
  if (!photoUrl) return null;
  try {
    if (photoUrl.startsWith('data:image/')) {
      const matches = photoUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (matches) {
        const rawExt = matches[1].toLowerCase();
        const ext = rawExt === 'jpg' ? 'jpeg' : rawExt;
        return {
          buffer: Buffer.from(matches[2], 'base64'),
          extension: ['jpeg', 'png', 'gif'].includes(ext) ? (ext as any) : 'jpeg',
        };
      }
    }
    let relativePath = photoUrl.startsWith('/') ? photoUrl.slice(1) : photoUrl;
    const fullPath = path.join(process.cwd(), 'public', relativePath);
    if (fs.existsSync(fullPath)) {
      const extName = path.extname(fullPath).toLowerCase().replace('.', '');
      const ext = extName === 'jpg' ? 'jpeg' : extName;
      return {
        buffer: fs.readFileSync(fullPath),
        extension: ['jpeg', 'png', 'gif'].includes(ext) ? (ext as any) : 'jpeg',
      };
    }
  } catch (e) {
    console.warn(`[PHOTO LOADER WARNING] Could not read photo from ${photoUrl}:`, e);
  }
  return null;
}

/**
 * Programmatic Repeating Block Pattern Walker for Photo Sheets (Inspection Photos & Defects Photos)
 * Detects & walks the repeating block pattern:
 * Each block has 4 photo slots (2x2 grid or row of 4 slots) followed by a caption band under each slot.
 * The pattern repeats down the sheet every 14 rows.
 */
export function walkAndWritePhotoBlocks(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  photosList: Array<{ photoUrl: string; description?: string; defectCode?: string; severity?: string }>
) {
  const ws = workbook.getWorksheet(sheetName);
  if (!ws) return;

  // Unmerge any existing placeholder range in template if needed
  try {
    ws.unMergeCells('A4:F25');
    ws.unMergeCells('A4:F30');
  } catch (e) {}

  const slotsPerBlock = 4;
  const blockRowHeight = 14;
  const startBaseRow = 4;

  photosList.forEach((photoItem, index) => {
    const imgInfo = getPhotoBuffer(photoItem.photoUrl);
    if (!imgInfo) return;

    const imageId = workbook.addImage({
      buffer: imgInfo.buffer as any,
      extension: imgInfo.extension,
    });

    const blockIndex = Math.floor(index / slotsPerBlock);
    const slotInBlock = index % slotsPerBlock;

    const blockStartRow = startBaseRow + blockIndex * blockRowHeight;

    const isRightCol = slotInBlock % 2 === 1;
    const isSecondRowInBlock = slotInBlock >= 2;

    const startCol = isRightCol ? 3 : 0;
    const endCol = isRightCol ? 6 : 3;
    const rowTop = blockStartRow + (isSecondRowInBlock ? 7 : 0);
    const rowBottom = rowTop + 5;
    const captionRow = rowBottom + 1;

    ws.addImage(imageId, {
      tl: { col: startCol, row: rowTop },
      br: { col: endCol, row: rowBottom },
      editAs: 'oneCell',
    } as any);

    // Write Caption into caption band
    const captionCell = ws.getCell(captionRow, startCol + 1);
    let captionText = photoItem.description || `Photo #${index + 1}`;
    if (photoItem.defectCode) {
      captionText = `[Defect ${photoItem.defectCode}${photoItem.severity ? ` - ${photoItem.severity}` : ''}] ${captionText}`;
    }

    captionCell.value = captionText;
    captionCell.font = {
      name: 'Arial',
      size: 9,
      italic: true,
      bold: true,
      color: { argb: 'FF1E293B' },
    };
    captionCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
}
