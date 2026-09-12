import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';

const execPromise = util.promisify(exec);

export async function convertExcelToPdf(excelFilePath: string): Promise<{ pdfPath: string; relativePdfUrl: string }> {
  const absExcelPath = path.isAbsolute(excelFilePath)
    ? excelFilePath
    : path.join(process.cwd(), excelFilePath.startsWith('/') ? excelFilePath.slice(1) : excelFilePath);

  if (!fs.existsSync(absExcelPath)) {
    throw new Error(`Excel file not found for PDF conversion at: ${absExcelPath}`);
  }

  const pdfFilename = path.basename(absExcelPath, path.extname(absExcelPath)) + '.pdf';
  const reportsDir = path.dirname(absExcelPath);
  const absPdfPath = path.join(reportsDir, pdfFilename);

  const scriptPath = path.join(process.cwd(), 'scripts', 'convert-excel-to-pdf.ps1');

  try {
    console.log(`[PDF CONVERTER] Converting ${absExcelPath} -> ${absPdfPath}`);
    const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" -ExcelPath "${absExcelPath}" -PdfPath "${absPdfPath}"`;
    const { stdout, stderr } = await execPromise(command, { timeout: 30000 });
    console.log('[PDF CONVERTER STDOUT]', stdout);

    if (fs.existsSync(absPdfPath)) {
      return {
        pdfPath: absPdfPath,
        relativePdfUrl: `/reports/${pdfFilename}`,
      };
    }
    throw new Error('PDF file was not created by PowerShell script.');
  } catch (error: any) {
    console.error('[PDF CONVERTER ERROR] Primary PowerShell converter failed:', error);
    // If PDF file exists despite non-zero exit code or warning
    if (fs.existsSync(absPdfPath)) {
      return {
        pdfPath: absPdfPath,
        relativePdfUrl: `/reports/${pdfFilename}`,
      };
    }
    throw new Error(`Failed to convert Excel to PDF: ${error.message || error}`);
  }
}
