'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function InspectionsDashboard() {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'completed'>('all');

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <FileSpreadsheet className="w-4 h-4" />
              Inspection Digitization System
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">QA Inspection Reports</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Data entry web interface linked directly to company Master Excel templates.
            </p>
          </div>

          <Link
            href="/inspections/new"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition"
          >
            <Plus className="w-5 h-5" />
            START NEW INSPECTION
          </Link>
        </div>

        {/* Stats Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Inspections</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCount}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Draft Inspections</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{draftCount}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed Reports</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{completedCount}</h3>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Reports ({totalCount})
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition ${
                filterStatus === 'draft'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Drafts ({draftCount})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition ${
                filterStatus === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search PO #, factory, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Inspections List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-500">Loading inspection records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center p-6">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full mb-4">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No Inspections Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
              Get started by creating a new inspection draft. All data will be mapped to your master Excel report.
            </p>
            <Link
              href="/inspections/new"
              className="px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              Start New Inspection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Status & ID Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
                        {item.inspectionNumber}
                      </span>
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded">
                        V{item.currentVersion || 1}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        item.status === 'FINALIZED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : item.status === 'REVISED'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400'
                          : item.status === 'ready_for_review'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}
                    >
                      {item.status || 'DRAFT'}
                    </span>
                  </div>

                  {/* PO Details */}
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                    PO: {item.poNumber || 'Unassigned'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-4">
                    {item.productDescription || 'Garment Item Description'}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Building className="w-3.5 h-3.5" /> Factory:
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.factoryName || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" /> Date:
                      </span>
                      <span>{item.inspectionDate || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Overall Result:</span>
                      <span
                        className={`font-bold ${
                          item.overallResult === 'FAIL'
                            ? 'text-red-600'
                            : item.overallResult === 'ON HOLD'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {item.overallResult || 'PASS'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedHistoryItem(item)}
                      className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
                      title="View Version History"
                    >
                      History
                    </button>

                    <Link
                      href={`/inspections/${item.id}/preview`}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
                    >
                      Preview
                    </Link>

                    <Link
                      href={`/inspections/${item.id}`}
                      className="flex items-center gap-1 px-3 py-2 bg-slate-900 text-white dark:bg-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                    >
                      Edit
                    </Link>

                    {item.excelFilePath && (
                      <a
                        href={`/api/inspections/${item.id}/download`}
                        download
                        className="flex items-center gap-1 px-2.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Version History: {selectedHistoryItem.inspectionNumber}
                </h3>
                <p className="text-xs text-slate-500">PO: {selectedHistoryItem.poNumber} | Current: Version V{selectedHistoryItem.currentVersion || 1}</p>
              </div>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {/* Current Version */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-blue-700 dark:text-blue-400">
                    Version V{selectedHistoryItem.currentVersion || 1} (Active)
                  </span>
                  <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
                    {selectedHistoryItem.status || 'DRAFT'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Last updated: {new Date(selectedHistoryItem.updatedAt).toLocaleString()}
                </p>
                {selectedHistoryItem.excelFilePath && (
                  <div className="pt-1">
                    <a
                      href={`/api/inspections/${selectedHistoryItem.id}/download`}
                      download
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Active Version Excel
                    </a>
                  </div>
                )}
              </div>

              {/* Archived Versions */}
              {selectedHistoryItem.versions && selectedHistoryItem.versions.length > 0 ? (
                selectedHistoryItem.versions.map((ver: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Version V{ver.versionNumber} Snapshot
                      </span>
                      <span className="text-[10px] text-slate-400">{new Date(ver.createdAt).toLocaleString()}</span>
                    </div>
                    {ver.changeReason && (
                      <p className="text-slate-600 dark:text-slate-400 italic">Reason: {ver.changeReason}</p>
                    )}
                    <p className="text-[11px] text-slate-500">Created by: {ver.createdByName || 'QA Auditor'}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-3">No previous archived versions recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
