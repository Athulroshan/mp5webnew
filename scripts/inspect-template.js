const ExcelJS = require('exceljs');
const path = require('path');

async function inspectTemplateDetailed() {
  const wb = new ExcelJS.Workbook();
  const templatePath = path.join(process.cwd(), 'public', 'templates', 'MPSS BLANK REPORT.xlsx');
  await wb.xlsx.readFile(templatePath);

  wb.worksheets.forEach((ws) => {
    let nonEmptyCount = 0;
    ws.eachRow({ includeEmpty: false }, (row, rNum) => {
      nonEmptyCount++;
    });
    console.log(`Sheet "${ws.name}": ${ws.rowCount} rows (actual non-empty rows: ${nonEmptyCount})`);
  });

  const targetSheets = ['Audit', 'MEASURE', 'Inspection photos', 'Defects photos', 'Points to check data', 'Defect Code'];

  targetSheets.forEach(name => {
    const ws = wb.getWorksheet(name);
    if (!ws) return;
    console.log(`\n================ SHEET DETAILS: ${name} ================`);
    ws.eachRow({ includeEmpty: false }, (row, rNum) => {
      if (rNum <= 40) {
        const rowVals = [];
        row.eachCell({ includeEmpty: false }, (cell) => {
          rowVals.push(`${cell.address}:${String(cell.value).slice(0, 30)}`);
        });
        if (rowVals.length > 0) {
          console.log(`Row ${rNum}: ${rowVals.join(' | ')}`);
        }
      }
    });
  });
}

inspectTemplateDetailed().catch(console.error);
