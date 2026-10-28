'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileEdit,
  Trash2,
  Building,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function InspectionsDashboard() {
  const router = useRouter();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'completed'>('all');

  // Start Inspection Dialog State
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [newReportNumber, setNewReportNumber] = useState('');
  const [dialogError, setDialogError] = useState('');

  const handleOpenStartDialog = () => {
    setNewReportNumber('');
    setDialogError('');
    setStartDialogOpen(true);
  };

  const handleStartInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newReportNumber.trim();
    if (!trimmed) {
      setDialogError('Please enter a valid report number.');
      return;
    }
    setStartDialogOpen(false);
    router.push(`/inspections/new?reportNumber=${encodeURIComponent(trimmed)}`);
  };

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inspections?status=${filterStatus}`);
      const data = await res.json();
      if (data.inspections) {
        setInspections(data.inspections);
      }
    } catch (err) {
      console.error('Error loading inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [filterStatus]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inspection record?')) return;
    try {
      await fetch(`/api/inspections/${id}`, { method: 'DELETE' });
      setInspections(inspections.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Error deleting inspection:', err);
    }
  };

  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);

  const filtered = inspections.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.inspectionNumber?.toLowerCase().includes(q) ||
      item.poNumber?.toLowerCase().includes(q) ||
      item.factoryName?.toLowerCase().includes(q) ||
      item.buyerBrand?.toLowerCase().includes(q) ||
      item.styleNumber?.toLowerCase().includes(q) ||
      item.inspectorName?.toLowerCase().includes(q) ||
      item.inspectionDate?.toLowerCase().includes(q)
    );
  });

  const totalCount = inspections.length;
  const draftCount = inspections.filter((i) => i.status === 'draft' || itemStatusIsDraft(i.status)).length;
  const completedCount = inspections.filter((i) => i.status === 'FINALIZED' || i.status === 'completed').length;

  function itemStatusIsDraft(status: string) {
    return status !== 'FINALIZED' && status !== 'completed';
  }

  return (
    <div className="min-h-screen bg-[#FBF3E8] text-[#1F1F1F] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-7 sm:p-8 rounded-[24px] border border-[#E8DAC8] shadow-xs">
          <div>
            <p className="eyebrow-label mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#C8452A]" />
              INSPECTION DIGITIZATION PLATFORM
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1F1F1F]">
              QA Inspection <span className="text-[#C8452A]">Reports &amp; Audits</span>
            </h1>
            <p className="text-sm text-[#4A4540] mt-1.5 leading-relaxed">
              Mobile-first data entry interface populating company 19-sheet Master Excel reports with embedded photo records.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenStartDialog}
            className="btn-pill-primary shrink-0 py-3.5 px-7 cursor-pointer flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>START NEW INSPECTION</span>
          </button>
        </div>

        {/* Stats Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-[24px] border border-[#E8DAC8] shadow-xs flex items-center gap-4">
            <div className="p-3 bg-[#F7ECE9] text-[#C8452A] rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#7A746E]">Total Inspections</p>
              <h3 className="text-2xl font-black text-[#1F1F1F]">{totalCount}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-[#E8DAC8] shadow-xs flex items-center gap-4">
            <div className="p-3 bg-[#FDF6E9] text-[#C68B2C] rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#7A746E]">Draft Audits</p>
              <h3 className="text-2xl font-black text-[#1F1F1F]">{draftCount}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-[#E8DAC8] shadow-xs flex items-center gap-4">
            <div className="p-3 bg-[#EFF3EB] text-[#4A5B38] rounded-2xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#7A746E]">Completed Reports</p>
              <h3 className="text-2xl font-black text-[#1F1F1F]">{completedCount}</h3>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[20px] border border-[#E8DAC8] shadow-xs">
          {/* Status Tabs */}
          <div className="flex p-1 bg-[#F3E6D3] rounded-full text-xs font-bold w-full sm:w-auto border border-[#E8DAC8]">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-full transition-all ${
                filterStatus === 'all'
                  ? 'bg-[#C8452A] text-white shadow-xs'
                  : 'text-[#4A4540] hover:text-[#1F1F1F]'
              }`}
            >
              All Reports ({totalCount})
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-full transition-all ${
                filterStatus === 'draft'
                  ? 'bg-[#C8452A] text-white shadow-xs'
                  : 'text-[#4A4540] hover:text-[#1F1F1F]'
              }`}
            >
              Drafts ({draftCount})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-full transition-all ${
                filterStatus === 'completed'
                  ? 'bg-[#C8452A] text-white shadow-xs'
                  : 'text-[#4A4540] hover:text-[#1F1F1F]'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A746E]" />
            <input
              type="text"
              placeholder="Search PO #, factory, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-[#FBF3E8]/50 border border-[#E8DAC8] rounded-full focus:outline-none focus:ring-2 focus:ring-[#C8452A]"
            />
          </div>
        </div>

        {/* Inspections Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[24px] border border-[#E8DAC8]">
            <div className="w-8 h-8 border-4 border-[#C8452A] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-[#7A746E]">Loading inspection records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[24px] border border-[#E8DAC8] text-center p-6">
            <div className="p-4 bg-[#F3E6D3] text-[#C8452A] rounded-full mb-4">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#1F1F1F]">No Inspections Found</h3>
            <p className="text-xs text-[#7A746E] max-w-sm mt-1 mb-6">
              Get started by creating a new inspection draft. All data will be mapped to your master Excel report.
            </p>
            <button
              type="button"
              onClick={handleOpenStartDialog}
              className="btn-pill-primary text-xs py-2.5 px-6 cursor-pointer"
            >
              Start New Inspection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E8DAC8] rounded-[24px] p-6 shadow-xs hover:border-[#C8452A] transition-all flex flex-col justify-between hover:-translate-y-0.5"
              >
                <div>
                  {/* Status & ID Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#C8452A] bg-[#F7ECE9] px-2.5 py-1 rounded-full">
                        {item.inspectionNumber}
                      </span>
                      <span className="text-[10px] font-bold bg-[#EFF3EB] text-[#4A5B38] px-2 py-0.5 rounded-full border border-[#4A5B38]/20">
                        V{item.currentVersion || 1}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        item.status === 'FINALIZED'
                          ? 'bg-[#EFF3EB] text-[#4A5B38]'
                          : item.status === 'REVISED'
                          ? 'bg-[#EBF1F6] text-[#1F2E3D]'
                          : item.status === 'ready_for_review'
                          ? 'bg-[#FDF6E9] text-[#C68B2C]'
                          : 'bg-[#F3E6D3] text-[#4A4540]'
                      }`}
                    >
                      {item.status || 'DRAFT'}
                    </span>
                  </div>

                  {/* PO Details */}
                  <h4 className="text-base font-bold text-[#1F1F1F] truncate">
                    PO: {item.poNumber || 'Unassigned'}
                  </h4>
                  <p className="text-xs text-[#7A746E] truncate mb-4">
                    {item.productDescription || 'Garment Item Description'}
                  </p>

                  <div className="space-y-2 text-xs text-[#4A4540] mb-5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#7A746E]">
                        <Building className="w-3.5 h-3.5 text-[#C8452A]" /> Factory:
                      </span>
                      <span className="font-semibold text-[#1F1F1F]">{item.factoryName || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#7A746E]">
                        <Calendar className="w-3.5 h-3.5 text-[#C8452A]" /> Date:
                      </span>
                      <span>{item.inspectionDate || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#7A746E]">Overall Result:</span>
                      <span
                        className={`font-black ${
                          item.overallResult === 'FAIL'
                            ? 'text-red-600'
                            : item.overallResult === 'ON HOLD'
                            ? 'text-[#C68B2C]'
                            : 'text-[#4A5B38]'
                        }`}
                      >
                        {item.overallResult || 'PASS'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-[#E8DAC8]/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-[#7A746E] hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedHistoryItem(item)}
                      className="px-3 py-1.5 bg-[#F3E6D3] hover:bg-[#EFE2CF] text-[#1F1F1F] rounded-full text-xs font-semibold transition-colors"
                      title="View Version History"
                    >
                      History
                    </button>

                    <Link
                      href={`/inspections/${item.id}/preview`}
                      className="px-3 py-1.5 bg-[#F7ECE9] text-[#C8452A] border border-[#C8452A]/30 rounded-full text-xs font-bold hover:bg-[#C8452A] hover:text-white transition-colors"
                    >
                      Preview
                    </Link>

                    <Link
                      href={`/inspections/${item.id}`}
                      className="px-3.5 py-1.5 bg-[#1F1F1F] text-white rounded-full text-xs font-semibold hover:bg-[#C8452A] transition-colors"
                    >
                      Edit
                    </Link>

                    {item.excelFilePath && (
                      <a
                        href={`/api/inspections/${item.id}/download`}
                        download
                        className="p-2 bg-[#4A5B38] text-white rounded-full text-xs font-semibold hover:bg-[#3d4b2e] transition-colors"
                        title="Download Excel Report"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Version History Modal */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8DAC8] rounded-[28px] max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E8DAC8] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#1F1F1F]">
                  Version History: {selectedHistoryItem.inspectionNumber}
                </h3>
                <p className="text-xs text-[#7A746E]">PO: {selectedHistoryItem.poNumber} | Current: Version V{selectedHistoryItem.currentVersion || 1}</p>
              </div>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="px-3 py-1 text-xs font-bold bg-[#F3E6D3] text-[#1F1F1F] rounded-full hover:bg-[#EFE2CF]"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {/* Current Version */}
              <div className="p-4 bg-[#F7ECE9] border border-[#C8452A]/30 rounded-[20px] space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-[#C8452A]">
                    Version V{selectedHistoryItem.currentVersion || 1} (Active)
                  </span>
                  <span className="text-[10px] font-bold bg-[#C8452A] text-white px-2 py-0.5 rounded-full">
                    {selectedHistoryItem.status || 'DRAFT'}
                  </span>
                </div>
                <p className="text-xs text-[#4A4540]">
                  Last updated: {new Date(selectedHistoryItem.updatedAt).toLocaleString()}
                </p>
                {selectedHistoryItem.excelFilePath && (
                  <div className="pt-2">
                    <a
                      href={`/api/inspections/${selectedHistoryItem.id}/download`}
                      download
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C8452A] hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Active Version Excel
                    </a>
                  </div>
                )}
              </div>

              {/* Archived Versions */}
              {selectedHistoryItem.versions && selectedHistoryItem.versions.length > 0 ? (
                selectedHistoryItem.versions.map((ver: any, idx: number) => (
                  <div key={idx} className="p-3 bg-[#F3E6D3]/60 border border-[#E8DAC8] rounded-[18px] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1F1F1F]">
                        Version V{ver.versionNumber} Snapshot
                      </span>
                      <span className="text-[10px] text-[#7A746E]">{new Date(ver.createdAt).toLocaleString()}</span>
                    </div>
                    {ver.changeReason && (
                      <p className="text-[#4A4540] italic">Reason: {ver.changeReason}</p>
                    )}
                    <p className="text-[11px] text-[#7A746E]">Created by: {ver.createdByName || 'QA Auditor'}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#7A746E] text-center py-3">No previous archived versions recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── START NEW INSPECTION MODAL (REPORT NUMBER) ───────────────────────── */}
      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white p-6 sm:p-7 rounded-[28px] shadow-2xl border border-[#E8DAC8]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-[#C8452A] mb-1">
              <FileSpreadsheet className="w-4 h-4 text-[#C8452A]" />
              <span>New QA Inspection Audit</span>
            </div>
            <DialogTitle className="text-xl font-extrabold text-[#1F1F1F]">
              Enter Report Number
            </DialogTitle>
            <DialogDescription className="text-xs text-[#4A4540] mt-1 leading-relaxed">
              Please enter the unique Report Number to begin. This identifier will appear at the front of the audit page and be mapped into your master report.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleStartInspection} className="mt-5 space-y-4">
            <div>
              <label htmlFor="newReportNumberInput" className="block text-xs font-bold text-[#1F1F1F] mb-1.5">
                Report Number <span className="text-[#C8452A]">*</span>
              </label>
              <input
                id="newReportNumberInput"
                type="text"
                value={newReportNumber}
                onChange={(e) => {
                  setNewReportNumber(e.target.value);
                  if (dialogError) setDialogError('');
                }}
                placeholder="e.g. FI_MPSS_1314"
                autoFocus
                className="w-full text-sm px-4 py-3 bg-[#FBF3E8]/60 border border-[#E8DAC8] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8452A] font-semibold text-[#1F1F1F] placeholder:text-[#7A746E]/60 transition"
              />
              {dialogError && (
                <p className="text-xs text-red-600 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{dialogError}</span>
                </p>
              )}
            </div>

            <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStartDialogOpen(false)}
                className="rounded-full px-5 py-2.5 text-xs font-bold text-[#4A4540] border-[#E8DAC8] hover:bg-[#F3E6D3] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-pill-primary text-xs py-2.5 px-6 rounded-full cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>Start Inspection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
