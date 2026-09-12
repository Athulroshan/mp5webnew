'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface DocumentViewerProps {
  inspection: any;
  page?: number;
  zoom?: number;
}

export function ReportDocumentViewer({ inspection, page = 1, zoom = 100 }: DocumentViewerProps) {
  const [viewMode, setViewMode] = useState<'pdf' | 'html'>('pdf');

  if (!inspection) {
    return (
      <div className="p-12 text-center text-slate-400">
        <FileSpreadsheet className="w-12 h-12 mx-auto animate-pulse text-blue-500 mb-3" />
        <p className="text-sm font-semibold">Loading inspection report preview...</p>
      </div>
    );
  }

  // Derive PDF URL from Excel file path
  let pdfUrl = '';
  if (inspection.excelFilePath) {
    pdfUrl = inspection.excelFilePath.replace(/\.xlsx$/i, '.pdf');
  } else if (inspection.inspectionNumber && inspection.poNumber) {
    const safePO = inspection.poNumber.replace(/[^a-zA-Z0-9_-]/g, '');
    const vNum = inspection.currentVersion || 1;
    pdfUrl = `/reports/MPSS_${inspection.inspectionNumber}_${safePO}_V${vNum}.pdf`;
  }

  const items: any[] = inspection.itemsToCheck
    ? typeof inspection.itemsToCheck === 'string'
      ? JSON.parse(inspection.itemsToCheck)
      : inspection.itemsToCheck
    : [];

  const photos: any[] = inspection.photos || [];
  const measurements: any[] = inspection.measurements || [];
  const defects: any[] = inspection.defects || [];

  const inspectionPhotos = photos.filter((p: any) => p.type === 'inspection');
  const defectPhotos = photos.filter((p: any) => p.type === 'defect' || p.defectCode);
  const measurementPhoto = photos.find((p: any) => p.type === 'measurement');

  const scaleFactor = zoom / 100;

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* View Mode Toggle Switch */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
        <button
          type="button"
          onClick={() => setViewMode('pdf')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
            viewMode === 'pdf'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          NATIVE EXCEL PDF PREVIEW
        </button>
        <button
          type="button"
          onClick={() => setViewMode('html')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
            viewMode === 'html'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          STRUCTURED SHEET PREVIEW
        </button>
      </div>

      {/* View Mode 1: Native Converted PDF View */}
      {viewMode === 'pdf' && (
        <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center p-2">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
              title="Official Inspection Report PDF"
              className="w-full h-[750px] rounded-lg border border-slate-800"
            />
          ) : (
            <div className="p-12 text-center text-slate-400">
              <AlertCircle className="w-10 h-10 mx-auto text-amber-500 mb-2" />
              <p className="text-sm font-bold">PDF preview file is generating...</p>
            </div>
          )}
        </div>
      )}

      {/* View Mode 2: Structured Sheet View */}
      {viewMode === 'html' && (
        <div
          className="bg-white text-slate-900 shadow-2xl rounded-sm border border-slate-300 mx-auto transition-all duration-200 overflow-hidden font-sans select-none"
          style={{
            width: `${Math.round(820 * scaleFactor)}px`,
            minHeight: `${Math.round(1120 * scaleFactor)}px`,
            fontSize: `${12 * scaleFactor}px`,
          }}
        >
          {/* PAGE 1: AUDIT SHEET HEADER & CHECKLIST */}
          {page === 1 && (
            <div className="p-6 sm:p-8 space-y-4">
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h1 className="text-xl font-black text-blue-600 tracking-tight uppercase">
                  My Profile Sourcing Solutions
                </h1>
                <h2 className="text-sm font-bold text-slate-800 tracking-wider">
                  Final Inspection Report
                </h2>
              </div>

              {/* Top Metadata Grid */}
              <div className="border border-slate-800 text-[11px]">
                <div className="grid grid-cols-4 border-b border-slate-800 p-1.5 bg-slate-50">
                  <span className="font-bold text-slate-700">Product Description:</span>
                  <span className="col-span-2 font-semibold text-blue-950 truncate">{inspection.productDescription || "Men's Polo T-Shirt"}</span>
                  <span className="text-right font-bold text-slate-700">Date: <span className="bg-pink-100 text-pink-900 px-1 py-0.5 rounded font-mono">{inspection.inspectionDate}</span></span>
                </div>

                <div className="grid grid-cols-6 border-b border-slate-800 p-1.5 gap-1">
                  <span className="font-bold">Report No.:</span>
                  <span className="font-mono text-blue-800 font-bold">{inspection.inspectionNumber}</span>
                  <span className="font-bold">Agency:</span>
                  <span>{inspection.agentName || 'MPSS'}</span>
                  <span className="font-bold">Item/Style:</span>
                  <span className="font-mono font-bold">{inspection.styleNumber || 'YCAT0110'}</span>
                </div>

                <div className="grid grid-cols-6 border-b border-slate-800 p-1.5 gap-1">
                  <span className="font-bold">Customer:</span>
                  <span className="font-semibold">{inspection.buyerBrand || 'CAGI'}</span>
                  <span className="font-bold">Factory Name:</span>
                  <span className="font-semibold">{inspection.factoryName || 'JRP EXPORTS'}</span>
                  <span className="font-bold">Order Qty:</span>
                  <span className="font-bold text-blue-900">{inspection.poQuantity || 2600}</span>
                </div>

                <div className="grid grid-cols-6 border-b border-slate-800 p-1.5 gap-1">
                  <span className="font-bold">Account:</span>
                  <span>MENS</span>
                  <span className="font-bold">Location:</span>
                  <span className="truncate">Tirupur, India</span>
                  <span className="font-bold">PO Qty / Inspected:</span>
                  <span className="font-bold">{inspection.poNumber} ({inspection.inspectionQuantity})</span>
                </div>

                <div className="grid grid-cols-6 p-1.5 gap-1 bg-slate-50">
                  <span className="font-bold">Season:</span>
                  <span>{inspection.season || 'SUMMER'}</span>
                  <span className="font-bold">Color / Sizes:</span>
                  <span className="col-span-3 font-semibold">WHITE | M, L, XL</span>
                </div>
              </div>

              {/* ANSI AQL Sampling Box */}
              <div className="border border-slate-800 text-[11px] space-y-1">
                <div className="bg-slate-900 text-white font-bold px-2 py-1 flex justify-between">
                  <span>ANSI ASQ Z1.4 – 2003 AQL SAMPLING PLAN</span>
                  <span>Inspected Qty: {inspection.inspectionQuantity}</span>
                </div>
                <div className="grid grid-cols-3 p-2 gap-3 items-center">
                  <div className="space-y-1 text-slate-700">
                    <div>AQL Level: <span className="font-bold text-slate-900">Level II (2.5 / 4.0)</span></div>
                    <div>Critical Limit: <span className="font-bold">Acc 0 / Rej 1</span></div>
                    <div>Major Limit: <span className="font-bold">Acc 7 / Rej 8</span></div>
                    <div>Minor Limit: <span className="font-bold">Acc 10 / Rej 11</span></div>
                  </div>

                  <div className="border-x border-slate-300 px-2 space-y-1">
                    <div>Found Critical: <span className="font-bold text-emerald-700">0</span></div>
                    <div>Found Major: <span className="font-bold text-amber-700">{defects.filter((d: any) => d.severity === 'Major').length || 0}</span></div>
                    <div>Found Minor: <span className="font-bold text-slate-700">{defects.filter((d: any) => d.severity === 'Minor').length || 0}</span></div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Inspection Result</div>
                    <div
                      className={`py-1.5 px-3 rounded font-black text-xs text-white uppercase shadow-sm ${
                        inspection.overallResult === 'FAIL'
                          ? 'bg-red-600'
                          : inspection.overallResult === 'ON HOLD'
                          ? 'bg-amber-600'
                          : 'bg-emerald-600'
                      }`}
                    >
                      {inspection.overallResult || 'PASSED'} [X]
                    </div>
                  </div>
                </div>
              </div>

              {/* 22 Items to Check Table */}
              <div className="border border-slate-800 text-[10px]">
                <div className="bg-slate-900 text-white font-bold px-2 py-1">
                  ITEMS TO CHECK (QUALITY CHECKLIST)
                </div>
                <div className="divide-y divide-slate-200">
                  {items.slice(0, 14).map((it: any) => (
                    <div key={it.id} className="grid grid-cols-12 p-1 items-center">
                      <span className="col-span-1 text-center font-bold text-slate-500">{it.id}</span>
                      <span className="col-span-6 font-semibold truncate">{it.question}</span>
                      <span
                        className={`col-span-2 text-center font-bold px-1 rounded text-[9px] ${
                          it.status === 'NO'
                            ? 'bg-red-100 text-red-700'
                            : it.status === 'N/A'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {it.status || 'YES'} [X]
                      </span>
                      <span className="col-span-3 text-slate-500 truncate text-[9px] italic pl-1">
                        {it.comment || 'Conforms to approved sample'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: MEASUREMENT AUDIT */}
          {page === 2 && (
            <div className="p-6 sm:p-8 space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <h2 className="text-base font-black text-slate-900 uppercase">Garment Measurement Audit (MEASURE)</h2>
                <span className="text-[10px] font-bold text-slate-400">PO: {inspection.poNumber}</span>
              </div>

              <div className="border border-slate-800 text-[10px]">
                <div className="bg-slate-800 text-white font-bold grid grid-cols-10 p-1.5 text-center">
                  <span className="col-span-3 text-left pl-2">Measurement Point</span>
                  <span>Spec</span>
                  <span>Tol</span>
                  <span>S1</span>
                  <span>S2</span>
                  <span>S3</span>
                  <span>S4</span>
                  <span>Result</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {measurements.map((m: any, idx: number) => {
                    const actuals = typeof m.actualValues === 'string' ? JSON.parse(m.actualValues || '[]') : m.actualValues || [];
                    return (
                      <div key={idx} className="grid grid-cols-10 p-1.5 text-center items-center">
                        <span className="col-span-3 text-left pl-2 font-semibold">{m.measurementPoint}</span>
                        <span>{m.specRequired}</span>
                        <span className="text-slate-400">{m.tolerance}</span>
                        <span>{actuals[0] || '-'}</span>
                        <span>{actuals[1] || '-'}</span>
                        <span>{actuals[2] || '-'}</span>
                        <span>{actuals[3] || '-'}</span>
                        <span className={`font-bold ${m.result === 'FAIL' ? 'text-red-600' : 'text-emerald-700'}`}>
                          {m.result || 'PASS'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {measurementPhoto && (
                <div className="border border-slate-300 p-3 rounded space-y-1 bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Physical Measurement Chart Photo</span>
                  <img src={measurementPhoto.photoUrl} alt="Measurement Chart" className="max-h-64 rounded border object-contain mx-auto" />
                </div>
              )}
            </div>
          )}

          {/* PAGE 3: INSPECTION PHOTOS GALLERY */}
          {page === 3 && (
            <div className="p-6 sm:p-8 space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <h2 className="text-base font-black text-slate-900 uppercase">Inspection Photos Sheet</h2>
                <span className="text-[10px] font-bold text-slate-400">{inspectionPhotos.length} photos attached</span>
              </div>

              {inspectionPhotos.length === 0 ? (
                <div className="p-12 text-center text-slate-400 border border-dashed rounded-lg">
                  No inspection photos uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {inspectionPhotos.map((p: any, idx: number) => (
                    <div key={idx} className="border border-slate-300 p-2 rounded bg-slate-50 space-y-1.5">
                      <img src={p.photoUrl} alt={p.description || `Photo ${idx + 1}`} className="w-full h-44 object-cover rounded border" />
                      <p className="text-[10px] font-semibold text-slate-700 italic truncate">
                        #{idx + 1} — {p.description || 'Inspection detail photo'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PAGE 4: DEFECTS & CAP LOG */}
          {page === 4 && (
            <div className="p-6 sm:p-8 space-y-4">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <h2 className="text-base font-black text-slate-900 uppercase">Defects & Corrective Action Plan (CAP)</h2>
                <span className="text-[10px] font-bold text-red-600">{defects.length} defects logged</span>
              </div>

              <div className="border border-slate-800 text-[10px]">
                <div className="bg-slate-800 text-white font-bold grid grid-cols-12 p-1.5 text-center">
                  <span className="col-span-2 text-left pl-1">Code</span>
                  <span className="col-span-4 text-left">Description</span>
                  <span className="col-span-2">Severity</span>
                  <span className="col-span-1">Qty</span>
                  <span className="col-span-3 text-left">Location</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {defects.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 col-span-12">No defects found during inspection.</div>
                  ) : (
                    defects.map((d: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-12 p-1.5 text-center items-center">
                        <span className="col-span-2 text-left pl-1 font-mono font-bold text-blue-900">{d.defectCode}</span>
                        <span className="col-span-4 text-left font-semibold truncate">{d.description}</span>
                        <span className={`col-span-2 font-bold ${d.severity === 'Critical' ? 'text-red-600' : 'text-amber-600'}`}>
                          {d.severity}
                        </span>
                        <span className="col-span-1 font-bold">{d.quantity}</span>
                        <span className="col-span-3 text-left truncate text-slate-500">{d.location}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {defectPhotos.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[11px] font-bold text-slate-700 uppercase">Defect Photo Evidences</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {defectPhotos.map((dp: any, idx: number) => (
                      <div key={idx} className="border border-slate-300 p-2 rounded bg-slate-50 space-y-1">
                        <img src={dp.photoUrl} alt="Defect Detail" className="w-full h-36 object-cover rounded border" />
                        <p className="text-[9px] font-bold text-red-800 truncate">
                          {dp.defectCode ? `[${dp.defectCode}] ` : ''}{dp.description || 'Defect detail'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
