'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileSpreadsheet,
  Download,
  Edit,
  CheckCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Clock,
  History,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { ReportDocumentViewer } from '@/components/inspections/report-document-viewer';

export default function InspectionPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Document Viewer Controls
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;
  const [zoom, setZoom] = useState(100);

  // Action states
  const [finalizing, setFinalizing] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const fetchInspection = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/inspections/${id}`);
      const data = await res.json();
      if (data.inspection) {
        setInspection(data.inspection);
      } else {
        setError(data.error || 'Inspection not found');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load inspection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspection();
  }, [id]);

  const handleFinalize = async () => {
    if (!confirm('Are you sure you want to finalize this inspection report? Finalizing locks version V1 and prepares official document output.')) {
      return;
    }
    setFinalizing(true);
    try {
      const res = await fetch(`/api/inspections/${id}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalizedBy: 'QA Supervisor' }),
      });
      const data = await res.json();
      if (data.success) {
        setInspection(data.inspection);
        alert(`Inspection ${data.inspection.inspectionNumber} finalized successfully!`);
      } else {
        alert(`Finalization failed: ${data.error}`);
      }
    } catch (err) {
      alert('Error finalizing inspection');
    } finally {
      setFinalizing(false);
    }
  };

  const handleReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeReason.trim()) {
      alert('Please enter a valid Reason for Change.');
      return;
    }
    setReopening(true);
    try {
      const res = await fetch(`/api/inspections/${id}/reopen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeReason, performedByName: 'QA Supervisor' }),
      });
      const data = await res.json();
      if (data.success) {
        setShowReopenModal(false);
        setChangeReason('');
        router.push(`/inspections/${id}`);
      } else {
        alert(`Reopen failed: ${data.error}`);
      }
    } catch (err) {
      alert('Error reopening inspection');
    } finally {
      setReopening(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-400" />
          <p className="text-sm font-semibold">Loading inspection report preview...</p>
        </div>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
        <div className="text-center max-w-md bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold">Inspection Load Error</h2>
          <p className="text-xs text-slate-400">{error || 'Inspection record could not be loaded.'}</p>
          <button
            onClick={() => router.push('/inspections')}
            className="px-4 py-2 bg-blue-600 text-xs font-bold rounded-xl hover:bg-blue-700 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isFinalized = inspection.status === 'FINALIZED';
  const vNum = inspection.currentVersion || 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => router.push('/inspections')}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded uppercase">
                  {inspection.inspectionNumber}
                </span>
                <span className="text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                  Version V{vNum}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                    isFinalized
                      ? 'bg-emerald-600 text-white'
                      : inspection.status === 'REVISED'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {inspection.status || 'DRAFT'}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold truncate">
                {inspection.poNumber ? `PO: ${inspection.poNumber} (${inspection.factoryName})` : 'Inspection Report Preview'}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              <History className="w-4 h-4 text-blue-400" />
              <span className="hidden md:inline">History Log</span>
            </button>

            {isFinalized ? (
              <button
                onClick={() => setShowReopenModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-sm transition"
              >
                <Edit className="w-4 h-4" />
                CREATE NEW REVISION (V{vNum + 1})
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push(`/inspections/${id}`)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold rounded-xl border border-slate-700 transition"
                >
                  <Edit className="w-4 h-4 text-amber-400" />
                  EDIT INSPECTION
                </button>

                <button
                  onClick={handleFinalize}
                  disabled={finalizing}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold rounded-xl shadow-md transition"
                >
                  {finalizing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  FINALIZE REPORT
                </button>
              </>
            )}

            {inspection.excelFilePath && (
              <a
                href={`/api/inspections/${id}/download`}
                download
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-500/20 transition"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD EXCEL (V{vNum})
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Document Controls Bar */}
      <div className="bg-slate-900/80 border-b border-slate-800 py-2 px-4 sticky top-[61px] z-20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
          {/* Page Selector */}
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 bg-slate-800 disabled:opacity-30 rounded-lg hover:bg-slate-700 text-slate-300 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold text-slate-300">
              Page <span className="text-blue-400">{currentPage}</span> of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 bg-slate-800 disabled:opacity-30 rounded-lg hover:bg-slate-700 text-slate-300 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Page Jump Buttons */}
          <div className="hidden sm:flex items-center gap-1">
            {['1. Audit Header', '2. Measure', '3. Photos', '4. Defects & CAP'].map((title, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  currentPage === idx + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {title}
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(60, z - 10))}
              className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="font-mono text-slate-400 text-[11px] w-12 text-center">{zoom}%</span>

            <button
              onClick={() => setZoom((z) => Math.min(140, z + 10))}
              className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Document Viewport */}
      <main className="flex-1 overflow-auto py-8 px-4 flex items-center justify-center">
        <ReportDocumentViewer inspection={inspection} page={currentPage} zoom={zoom} />
      </main>

      {/* Reopen / New Revision Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-indigo-400">
              <RefreshCw className="w-6 h-6" />
              <h3 className="text-base font-extrabold text-white">Create New Revision (Version {vNum + 1})</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              This report is currently finalized. Reopening will unlock the inspection stepper and generate <span className="text-indigo-400 font-bold">Version {vNum + 1}</span> upon completion.
            </p>

            <form onSubmit={handleReopen} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Reason for Change <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Corrected PO quantity from 2500 to 2600"
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reopening}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md transition"
                >
                  {reopening ? 'Creating Version...' : `CREATE VERSION ${vNum + 1}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Log Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400">
                <History className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-white">Revision & Audit Trail</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {inspection.auditLogs && inspection.auditLogs.length > 0 ? (
                inspection.auditLogs.map((log: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-blue-400">{log.action}</span>
                      <span className="text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 font-medium">{log.details}</p>
                    <div className="text-[10px] text-slate-500 flex justify-between pt-1">
                      <span>By: {log.performedByName}</span>
                      <span>Version V{log.versionNumber}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-6">No audit history entries found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
