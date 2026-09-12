const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const sampleBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function test19SheetInspectionFlow() {
  console.log("=== STARTING 19-SHEET MASTER INSPECTION SYSTEM VERIFICATION ===");

  const reportsDir = path.join(process.cwd(), 'public', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const templatePath = path.join(process.cwd(), 'public', 'templates', 'Inspection_Report_Blank.xlsx');
  console.log("1. Checking Master Template exists:", fs.existsSync(templatePath));

  if (!fs.existsSync(templatePath)) {
    throw new Error("Master template missing!");
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);
  console.log("2. Total Worksheets in Master Template:", workbook.worksheets.length);
  console.log("   Sheet Names:", workbook.worksheets.map(w => w.name));

  const expected19Sheets = [
    'Audit', 'PACKING LIST', 'Remarks', 'MEASURE', 'Inspection photos',
    'Defects photos', 'Sample mailing sheet', 'Attachment', 'Container loading(Step 6)',
    'CAP', 'Picking', 'Table for Email Body', 'Defect Code', 'draftfull',
    'draftsimple', 'Shipment data', 'Inspection data', 'Points to check data', 'IT'
  ];

  for (const sheetName of expected19Sheets) {
    if (!workbook.getWorksheet(sheetName)) {
      throw new Error(`Missing expected sheet: ${sheetName}`);
    }
  }
  console.log("3. All 19 expected worksheets verified!");

  // Test Population on Audit Sheet
  const auditSheet = workbook.getWorksheet('Audit');
  auditSheet.getCell('B5').value = 'INS-2026-TEST19';
  auditSheet.getCell('B6').value = 'PO4500159665';
  auditSheet.getCell('F6').value = 2600;
  auditSheet.getCell('H6').value = 125;
  auditSheet.getCell('B8').value = 'JRP EXPORTS';
  auditSheet.getCell('H8').value = 'SUMMER';
  auditSheet.getCell('B10').value = 'MPSS Brands';
  auditSheet.getCell('F10').value = 'TS-9092';
  auditSheet.getCell('B12').value = 'Men Crew Neck 100% Cotton Polo T-Shirt';

  // Test Checklist Question #1
  auditSheet.getCell('E24').value = 'YES';
  auditSheet.getCell('F24').value = 'Conforms to approved standard sample';

  // Visual & Overall
  auditSheet.getCell('B49').value = 'PASS';
  auditSheet.getCell('F49').value = 'PASS';
  auditSheet.getCell('H49').value = 'PASS';

  // Embed Image into Inspection Photos
  const imageBuffer = Buffer.from(sampleBase64Image.replace(/^data:image\/png;base64,/, ''), 'base64');
  const imgId = workbook.addImage({
    buffer: imageBuffer,
    extension: 'png',
  });

  const inspectionPhotosSheet = workbook.getWorksheet('Inspection photos');
  inspectionPhotosSheet.addImage(imgId, {
    tl: { col: 0, row: 4 },
    br: { col: 3, row: 14 },
  });

  const testReportFile = path.join(reportsDir, 'Inspection_INS-2026-TEST19_PO4500159665.xlsx');
  await workbook.xlsx.writeFile(testReportFile);

  console.log("4. Generated test report saved to:", testReportFile);
  console.log("5. File size:", fs.statSync(testReportFile).size, "bytes");

  // Read back generated workbook
  const readBackWb = new ExcelJS.Workbook();
  await readBackWb.xlsx.readFile(testReportFile);
  const readAudit = readBackWb.getWorksheet('Audit');

  console.log("6. Readback Cell B5 (Report No):", readAudit.getCell('B5').value);
  console.log("7. Readback Cell B6 (PO Number):", readAudit.getCell('B6').value);
  console.log("8. Readback Cell E24 (Checklist #1):", readAudit.getCell('E24').value);
  console.log("9. Readback Cell H49 (Overall Result):", readAudit.getCell('H49').value);

  if (
    readAudit.getCell('B5').value === 'INS-2026-TEST19' &&
    readAudit.getCell('B6').value === 'PO4500159665' &&
    readAudit.getCell('E24').value === 'YES' &&
    readAudit.getCell('H49').value === 'PASS'
  ) {
    console.log("=== ALL 19-SHEET VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
  } else {
    throw new Error("Cell verification failed!");
  }
}

test19SheetInspectionFlow().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
