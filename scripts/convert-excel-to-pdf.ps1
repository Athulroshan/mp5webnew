param (
    [Parameter(Mandatory=$true)]
    [string]$ExcelPath,
    
    [Parameter(Mandatory=$true)]
    [string]$PdfPath
)

$ErrorActionPreference = "Stop"

try {
    Write-Host "[PDF CONVERTER] Starting Native Excel COM PDF conversion..."
    Write-Host "  Source XLSX: $ExcelPath"
    Write-Host "  Target PDF : $PdfPath"

    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $excel.ScreenUpdating = $false

    $absExcelPath = [System.IO.Path]::GetFullPath($ExcelPath)
    $absPdfPath = [System.IO.Path]::GetFullPath($PdfPath)

    $workbook = $excel.Workbooks.Open($absExcelPath)
    
    # Recalculate all formulas natively
    Write-Host "  Recalculating formulas..."
    $excel.CalculateFull()
    $workbook.Save()

    # Export to PDF (Type 0 = xlTypePDF)
    Write-Host "  Exporting to PDF..."
    $workbook.ExportAsFixedFormat(0, $absPdfPath)
    $workbook.Close($false)
    $excel.Quit()

    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    Write-Host "[PDF CONVERTER SUCCESS] PDF generated successfully at: $absPdfPath"
    exit 0
} catch {
    Write-Error "[PDF CONVERTER ERROR] Failed to convert Excel to PDF: $_"
    if ($excel) {
        try { $excel.Quit() } catch {}
    }
    exit 1
}
