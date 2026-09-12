import React from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  CheckCircle,
  Plus,
  ShieldCheck,
  Smartphone,
  Download,
  Camera,
  Layers,
  FileCheck,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

export const metadata = {
  title: 'Garment Inspection Digitization System | MPSS Services',
  description: 'Easy Google-Form-style web interface linked directly to company Master Excel Inspection Report templates.',
};

export default function InspectionSystemServicesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Service Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" />
            MPSS QA Digitization Platform
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Garment Inspection Digitization System
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            A mobile-first, Google-Form-style QA data entry platform that maps all inspection inputs, photos, checklist items, and measurement specs directly into your company's official **19-Worksheet Master Excel Report Template**.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/inspections/new"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition"
            >
              <Plus className="w-5 h-5" />
              START NEW INSPECTION
            </Link>

            <Link
              href="/inspections"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ClipboardList className="w-5 h-5 text-blue-500" />
              VIEW INSPECTION DASHBOARD
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl w-fit">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold">Google-Form-Style Mobile Entry</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Step-by-step 8-section wizard designed for phone/tablet camera photo capture, live tolerance evaluation, and quick QA responses.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl w-fit">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold">19-Worksheet Master Excel Preserved</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Preserves all 19 original worksheets (`Audit`, `MEASURE`, `Inspection photos`, `Defects photos`, `CAP`, `PACKING LIST`, etc.) without altering formatting or formulas.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl w-fit">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold">Embedded Photo Grid Reports</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Photos are scaled and embedded directly inside the Excel photo worksheets in a 4-column structured grid alongside captions.
            </p>
          </div>
        </div>

        {/* System Workflow Steps */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold">Inspection Digitization Workflow</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">End-to-end data entry to downloadable Excel report execution.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
              <span className="text-xs font-black text-blue-600">STEP 01</span>
              <h4 className="font-bold">QA Data Entry</h4>
              <p className="text-slate-500">QA enters PO details, answers 22 checklist items, and takes camera photos.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
              <span className="text-xs font-black text-blue-600">STEP 02</span>
              <h4 className="font-bold">Structured Database Sync</h4>
              <p className="text-slate-500">Data automatically autosaves to draft records and syncs measurements.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
              <span className="text-xs font-black text-blue-600">STEP 03</span>
              <h4 className="font-bold">Excel Engine Population</h4>
              <p className="text-slate-500">Clones master template, embeds images into cells, and computes AQL results.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
              <span className="text-xs font-black text-blue-600">STEP 04</span>
              <h4 className="font-bold">Instant Download</h4>
              <p className="text-slate-500">QA downloads the completed `.xlsx` report (`Inspection_INS-2026-XXXXX_PO.xlsx`).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
