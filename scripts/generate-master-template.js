const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function generateExactMasterTemplate() {
  const templatesDir = path.join(process.cwd(), 'public', 'templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'My Profile Sourcing Solutions';
  workbook.lastModifiedBy = 'MPSS QA Engine';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Helper styles matching Image 2
  const brandTitleFont = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF0284C7' } }; // Blue Title
  const reportTitleFont = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF000000' } };
  const labelFont = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF000000' } };
  const valFont = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF1E40AF' } }; // Blue text for entries
  const borderThin = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  };

  const setColWidths = (ws) => {
    ws.columns = [
      { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 },
      { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 },
      { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }
    ];
  };

  // -------------------------------------------------------------
  // 1. AUDIT WORKSHEET (Exact Match to Image 2)
  // -------------------------------------------------------------
  const auditSheet = workbook.addWorksheet('Audit');
  auditSheet.views = [{ showGridLines: true }];

  // Row 1: Brand Title
  auditSheet.mergeCells('A1:L1');
  const bTitle = auditSheet.getCell('A1');
  bTitle.value = 'My Profile Sourcing Solutions';
  bTitle.font = brandTitleFont;
  bTitle.alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 2: Report Title
  auditSheet.mergeCells('A2:L2');
  const rTitle = auditSheet.getCell('A2');
  rTitle.value = 'Final Inspection Report';
  rTitle.font = reportTitleFont;
  rTitle.alignment = { horizontal: 'center', vertical: 'middle' };

  // Row 4: Header line 1
  auditSheet.getCell('A4').value = 'Product Description:';
  auditSheet.getCell('A4').font = labelFont;
  auditSheet.mergeCells('B4:D4');
  auditSheet.getCell('B4').value = 'Men Crew Neck 100% Cotton Polo T-Shirt';
  auditSheet.getCell('B4').font = valFont;

  auditSheet.getCell('E4').value = 'Inspection Team:';
  auditSheet.getCell('E4').font = labelFont;
  auditSheet.getCell('F4').value = 'My Profile Sourcing Solutions';
  auditSheet.getCell('F4').font = valFont;

  auditSheet.getCell('H4').value = 'Inspection Date:';
  auditSheet.getCell('H4').font = labelFont;
  auditSheet.getCell('I4').value = '20-04-2025';
  auditSheet.getCell('I4').font = valFont;
  auditSheet.getCell('I4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE7F3' } }; // Pink date fill

  // Row 5
  auditSheet.getCell('A5').value = 'Report No.:';
  auditSheet.getCell('A5').font = labelFont;
  auditSheet.getCell('B5').value = 'FI_MPSS_1313';
  auditSheet.getCell('B5').font = valFont;

  auditSheet.getCell('C5').value = 'Agency:';
  auditSheet.getCell('C5').font = labelFont;
  auditSheet.getCell('D5').value = 'MPSS Agency';
  auditSheet.getCell('D5').font = valFont;

  auditSheet.getCell('E5').value = 'Item / Style No.:';
  auditSheet.getCell('E5').font = labelFont;
  auditSheet.getCell('F5').value = 'YCAT0110';
  auditSheet.getCell('F5').font = valFont;

  // Row 6
  auditSheet.getCell('A6').value = 'Customer:';
  auditSheet.getCell('A6').font = labelFont;
  auditSheet.getCell('B6').value = 'CAGI';
  auditSheet.getCell('B6').font = valFont;

  auditSheet.getCell('C6').value = 'Factory Name:';
  auditSheet.getCell('C6').font = labelFont;
  auditSheet.getCell('D6').value = 'JRP EXPORTS';
  auditSheet.getCell('D6').font = valFont;

  auditSheet.getCell('E6').value = 'Order Quantity:';
  auditSheet.getCell('E6').font = labelFont;
  auditSheet.getCell('F6').value = 2600;
  auditSheet.getCell('F6').font = valFont;

  // Row 7
  auditSheet.getCell('A7').value = 'Account:';
  auditSheet.getCell('A7').font = labelFont;
  auditSheet.getCell('B7').value = 'MENS';
  auditSheet.getCell('B7').font = valFont;

  auditSheet.getCell('C7').value = 'Factory Location:';
  auditSheet.getCell('C7').font = labelFont;
  auditSheet.getCell('D7').value = 'SEYENTHAMPALAYAM';
  auditSheet.getCell('D7').font = valFont;

  auditSheet.getCell('E7').value = 'Purchase Order No.:';
  auditSheet.getCell('E7').font = labelFont;
  auditSheet.getCell('F7').value = '4500159665';
  auditSheet.getCell('F7').font = valFont;

  // Row 8
  auditSheet.getCell('A8').value = 'Merchandiser:';
  auditSheet.getCell('A8').font = labelFont;
  auditSheet.getCell('B8').value = 'DHANAPAL';
  auditSheet.getCell('B8').font = valFont;

  auditSheet.getCell('C8').value = 'Country of Origin:';
  auditSheet.getCell('C8').font = labelFont;
  auditSheet.getCell('D8').value = 'INDIA';
  auditSheet.getCell('D8').font = valFont;

  auditSheet.getCell('E8').value = 'Program / Season Name:';
  auditSheet.getCell('E8').font = labelFont;
  auditSheet.getCell('F8').value = 'SUMMER';
  auditSheet.getCell('F8').font = valFont;

  // Row 9 & 10: Garment Types
  auditSheet.getCell('A9').value = '[X] Knitted';
  auditSheet.getCell('B9').value = '[ ] Woven';
  auditSheet.getCell('C9').value = '[ ] Sets';
  auditSheet.getCell('D9').value = 'Color Ways:';
  auditSheet.getCell('E9').value = 'WHITE';

  auditSheet.getCell('A10').value = '[X] Adults';
  auditSheet.getCell('B10').value = '[ ] Boys';
  auditSheet.getCell('C10').value = '[ ] Girls';
  auditSheet.getCell('D10').value = 'Size:';
  auditSheet.getCell('E10').value = 'M,L,XL';

  // Apply underline formatting for top metadata area
  for (let r = 4; r <= 11; r++) {
    for (let c = 1; c <= 10; c++) {
      const cell = auditSheet.getCell(r, c);
      cell.border = { bottom: { style: 'thin', color: { argb: 'FF000000' } } };
    }
  }

  // Row 13: Type Matrix Header
  const typeHeaders = ['Type of Sample', 'Type of Inspection', 'Type of Order', 'Total Cartons', 'Ship by', 'PO No.', 'PO Qty', 'Qty Ship', 'Qty Insp', 'Destination'];
  typeHeaders.forEach((h, i) => {
    const c = auditSheet.getCell(13, i + 1);
    c.value = h;
    c.font = labelFont;
    c.border = borderThin;
    c.alignment = { horizontal: 'center' };
  });

  // Type matrix data rows
  const typeRows = [
    ['Fit / Size Set Sample', '1st Batch | Pre-Final', 'Replenishment', 'Req: 53', 'Sea [X]', '4500159665', 2600, 2592, 125, 'USA'],
    ['Pre-Production Sample', 'In-line [X] | Final [X]', 'New Order [X]', 'Ship: 53', 'Air [ ]', '', '', '', '', ''],
    ['TOP Sample', 'Re-Inline | Re-Final', '', 'Opened: 14', '', '', '', '', '', ''],
    ['Reference Sample', '', '', '', '', 'TOTAL', 2600, '', '', '']
  ];

  typeRows.forEach((rVals, i) => {
    const rIdx = 14 + i;
    rVals.forEach((val, cIdx) => {
      const cell = auditSheet.getCell(rIdx, cIdx + 1);
      cell.value = val;
      cell.font = valFont;
      cell.border = borderThin;
      cell.alignment = { horizontal: 'center' };
    });
  });

  // Row 19: AQL Section (ANSI ASQ Z1.4 - 2003)
  auditSheet.mergeCells('A19:C19');
  auditSheet.getCell('A19').value = 'ANSI ASQ Z1.4 – 2003 AQL SAMPLING PLAN';
  auditSheet.getCell('A19').font = labelFont;

  auditSheet.getCell('A20').value = 'AQL Critical: 0 | Major: 2.5 | Minor: 4.0';
  auditSheet.getCell('B20').value = 'Level II [X]';
  auditSheet.getCell('C20').value = 'Inspected Qty: 125';

  auditSheet.getCell('D20').value = 'Critical Accept / Reject:';
  auditSheet.getCell('E20').value = '0';
  auditSheet.getCell('D21').value = 'Major Accept / Reject:';
  auditSheet.getCell('E21').value = '7 / 8';
  auditSheet.getCell('D22').value = 'Minor Accept / Reject:';
  auditSheet.getCell('E22').value = '10 / 11';

  auditSheet.getCell('D23').value = 'Total Critical Defect:';
  auditSheet.getCell('E23').value = '0';
  auditSheet.getCell('D24').value = 'Total Major Defect:';
  auditSheet.getCell('E24').value = '2';
  auditSheet.getCell('D25').value = 'Total Minor Defect:';
  auditSheet.getCell('E25').value = '3';

  // Result Box
  auditSheet.getCell('F20').value = 'PASSED: [X]';
  auditSheet.getCell('F20').font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  auditSheet.getCell('F20').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF166534' } };

  auditSheet.getCell('F21').value = 'FAILED: [ ]';
  auditSheet.getCell('F21').font = labelFont;

  auditSheet.getCell('F22').value = 'PENDING: [ ]';
  auditSheet.getCell('F22').font = labelFont;

  auditSheet.getCell('F23').value = 'NEED IMPROVEMENT: [ ]';
  auditSheet.getCell('F23').font = labelFont;

  auditSheet.mergeCells('G20:I25');
  const remarkBox = auditSheet.getCell('G20');
  remarkBox.value = 'Poor pressing on XXL size need to correct before shipping the goods';
  remarkBox.font = { name: 'Arial', size: 9, color: { argb: 'FFDC2626' } };
  remarkBox.alignment = { wrapText: true, vertical: 'top' };

  for (let r = 19; r <= 25; r++) {
    for (let c = 1; c <= 9; c++) {
      auditSheet.getCell(r, c).border = borderThin;
    }
  }

  // Row 27: Items to Check Section
  auditSheet.mergeCells('A27:I27');
  auditSheet.getCell('A27').value = 'Items to Check';
  auditSheet.getCell('A27').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF0284C7' } };
  auditSheet.getCell('A27').alignment = { horizontal: 'center' };

  const questions22 = [
    'Approved Prod Spec - BOM', 'Main & Care Label', 'Carton Label Placement',
    'Carton Label Barcode Printable & Scannable', 'Wide Goods per Approved',
    'Trims - Components per Approved', 'Fabric Weight', 'TOP Samples Pulled Out from the Bulk',
    'Fabric Color', 'Moisture Level Test', 'Metal Detection Check', 'Packing Method',
    'Hanging Method', 'Correct Carton Used', 'Cartons Too Empty / Overloaded / Damaged',
    'UPC / Barcode', 'Hang / Collar Tags', 'Draw String Review', 'Sharp Points & Sharp Edges',
    'Small Parts', 'Smell Check', 'Lab Test Report'
  ];

  questions22.forEach((q, i) => {
    const r = 28 + i;
    auditSheet.getCell(`A${r}`).value = i + 1;
    auditSheet.mergeCells(`B${r}:D${r}`);
    auditSheet.getCell(`B${r}`).value = q;
    auditSheet.getCell(`B${r}`).font = labelFont;

    auditSheet.getCell(`E${r}`).value = 'YES [X]';
    auditSheet.getCell(`E${r}`).font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF166534' } };

    auditSheet.mergeCells(`F${r}:I${r}`);
    auditSheet.getCell(`F${r}`).value = 'Conforms to approved standard sample';
    auditSheet.getCell(`F${r}`).font = valFont;

    for (let c = 1; c <= 9; c++) {
      auditSheet.getCell(r, c).border = borderThin;
    }
  });

  // -------------------------------------------------------------
  // OTHER 18 WORKSHEETS
  // -------------------------------------------------------------
  const packingSheet = workbook.addWorksheet('PACKING LIST');
  const remarksSheet = workbook.addWorksheet('Remarks');
  const measureSheet = workbook.addWorksheet('MEASURE');
  const inspectionPhotosSheet = workbook.addWorksheet('Inspection photos');
  const defectsPhotosSheet = workbook.addWorksheet('Defects photos');
  const sampleMailingSheet = workbook.addWorksheet('Sample mailing sheet');
  const attachmentSheet = workbook.addWorksheet('Attachment');
  const containerSheet = workbook.addWorksheet('Container loading(Step 6)');
  const capSheet = workbook.addWorksheet('CAP');
  const pickingSheet = workbook.addWorksheet('Picking');
  const emailSheet = workbook.addWorksheet('Table for Email Body');
  const defectCodeSheet = workbook.addWorksheet('Defect Code');
  const draftfullSheet = workbook.addWorksheet('draftfull');
  const draftsimpleSheet = workbook.addWorksheet('draftsimple');
  const shipmentDataSheet = workbook.addWorksheet('Shipment data');
  const inspectionDataSheet = workbook.addWorksheet('Inspection data');
  const pointsToCheckSheet = workbook.addWorksheet('Points to check data');
  const itSheet = workbook.addWorksheet('IT');

  [
    auditSheet, packingSheet, remarksSheet, measureSheet, inspectionPhotosSheet,
    defectsPhotosSheet, sampleMailingSheet, attachmentSheet, containerSheet, capSheet,
    pickingSheet, emailSheet, defectCodeSheet, draftfullSheet, draftsimpleSheet,
    shipmentDataSheet, inspectionDataSheet, pointsToCheckSheet, itSheet
  ].forEach(setColWidths);

  const outputPath = path.join(templatesDir, 'Inspection_Report_Blank.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Exact Master Template matching Image 2 saved to: ${outputPath}`);
}

generateExactMasterTemplate().catch(err => {
  console.error("Error generating exact master template:", err);
  process.exit(1);
});
