import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'MPSS BLANK REPORT.xlsx');
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: 'Master template file not found' }, { status: 404 });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    // 1. Parse Defect Codes (~300 rows from 'Defect Code' or default full list)
    const defectCodes: Array<{ code: string; description: string; category?: string }> = [];
    const defectSheet = workbook.getWorksheet('Defect Code');
    if (defectSheet) {
      defectSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1) {
          const code = String(row.getCell(1).value || '').trim();
          const desc = String(row.getCell(2).value || '').trim();
          const cat = String(row.getCell(3).value || '').trim();
          if (code) {
            defectCodes.push({ code, description: desc || code, category: cat || 'General' });
          }
        }
      });
    }

    // Fallback standard defect codes if sheet rows are dynamic/empty
    if (defectCodes.length === 0) {
      const defaultDefects = [
        { code: 'DEF-001', description: 'Broken / Skipped Stitching', category: 'Workmanship' },
        { code: 'DEF-002', description: 'Open Seam / Uncut Thread', category: 'Workmanship' },
        { code: 'DEF-003', description: 'Fabric Hole / Tear', category: 'Material' },
        { code: 'DEF-004', description: 'Color Shade Variation', category: 'Dyeing' },
        { code: 'DEF-005', description: 'Oil Stain / Dirt Mark', category: 'Cleanliness' },
        { code: 'DEF-006', description: 'Puckering at Seam', category: 'Workmanship' },
        { code: 'DEF-007', description: 'Button Missing / Loose', category: 'Trims' },
        { code: 'DEF-008', description: 'Misaligned Label / Tag', category: 'Labeling' },
        { code: 'DEF-009', description: 'Measurement Out of Tolerance', category: 'Sizing' },
        { code: 'DEF-010', description: 'Poor Pressing / Creased Garment', category: 'Finishing' },
        { code: 'DEF-011', description: 'Zipper Jammed / Broken', category: 'Trims' },
        { code: 'DEF-012', description: 'Needle Chewed Fabric', category: 'Workmanship' },
        { code: 'DEF-013', description: 'Incorrect Care Label Content', category: 'Labeling' },
        { code: 'DEF-014', description: 'Carton Barcode Unscannable', category: 'Packaging' },
        { code: 'DEF-015', description: 'Uneven Hemline', category: 'Workmanship' },
      ];
      defectCodes.push(...defaultDefects);
    }

    // 2. Parse Points to Check items from 'Points to check data' or 'Audit'
    const pointsToCheckItems: Array<{ id: number; question: string; defaultStatus: string }> = [];
    const pointsSheet = workbook.getWorksheet('Points to check data');
    if (pointsSheet) {
      pointsSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1) {
          const q = String(row.getCell(2).value || row.getCell(1).value || '').trim();
          if (q) {
            pointsToCheckItems.push({ id: pointsToCheckItems.length + 1, question: q, defaultStatus: 'YES' });
          }
        }
      });
    }

    // 3. Types from Audit & Reference sheets
    const sampleTypes = ['Fit / Size Set Sample', 'Pre-Production Sample', 'TOP Sample', 'Reference Sample', 'Bulk Production'];
    const inspectionTypes = ['1st Batch | Pre-Final', 'In-line | Final', 'Re-Inline | Re-Final', 'Pre-Shipment Inspection (FRI)'];
    const orderTypes = ['New Order', 'Replenishment', 'Re-order', 'Repeat Order'];
    const aqlLevels = ['Level I', 'Level II', 'Level III'];

    return NextResponse.json({
      defectCodes,
      pointsToCheckItems,
      sampleTypes,
      inspectionTypes,
      orderTypes,
      aqlLevels,
    });
  } catch (error: any) {
    console.error('Error fetching reference data:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reference data' }, { status: 500 });
  }
}
