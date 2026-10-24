"use client";

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

export default function InspectionSystemServicesPage() {
  return (
    <div className="min-h-screen bg-[#FBF3E8] text-[#1F1F1F] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Service Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <p className="eyebrow-label mb-2 flex items-center justify-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#C8452A]" />
            MPSS QA DIGITIZATION PLATFORM
          </p>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-[#1F1F1F]">
            Garment Inspection <span className="text-[#C8452A]">Digitization System</span>
          </h1>

          <p className="text-sm sm:text-base text-[#4A4540] leading-relaxed">
            A mobile-first, Google-Form-style QA data entry platform that maps all inspection inputs, photos, checklist items, and measurement specs directly into your company's official <strong>19-Worksheet Master Excel Report Template</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/inspections/new"
              className="btn-pill-primary w-full sm:w-auto py-3.5 px-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>START NEW INSPECTION</span>
            </Link>

            <Link
              href="/inspections"
              className="btn-pill-secondary w-full sm:w-auto py-3.5 px-8"
            >
              <ClipboardList className="w-4 h-4 text-[#C8452A] mr-1" />
              <span>VIEW QA DASHBOARD</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-warm p-7 space-y-3">
            <div className="p-3 bg-[#F7ECE9] text-[#C8452A] rounded-2xl w-fit">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1F1F1F]">Google-Form-Style Mobile Entry</h3>
            <p className="text-xs text-[#4A4540] leading-relaxed">
              Step-by-step 8-section wizard designed for phone/tablet camera photo capture, live tolerance evaluation, and quick QA responses on the factory floor.
            </p>
          </div>

          <div className="card-warm p-7 space-y-3">
            <div className="p-3 bg-[#EFF3EB] text-[#4A5B38] rounded-2xl w-fit">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1F1F1F]">19-Worksheet Master Excel Preserved</h3>
            <p className="text-xs text-[#4A4540] leading-relaxed">
              Preserves all 19 original worksheets (Audit, MEASURE, Inspection photos, Defects photos, CAP, PACKING LIST, etc.) without altering formatting or formulas.
            </p>
          </div>

          <div className="card-warm p-7 space-y-3">
            <div className="p-3 bg-[#FDF6E9] text-[#C68B2C] rounded-2xl w-fit">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1F1F1F]">Embedded Photo Grid Reports</h3>
            <p className="text-xs text-[#4A4540] leading-relaxed">
              Photos are scaled and embedded directly inside Excel photo worksheets in a 4-column structured grid alongside timestamps and defect labels.
            </p>
          </div>
        </div>

        {/* System Workflow Steps */}
        <div className="bg-white p-8 sm:p-10 rounded-[28px] border border-[#E8DAC8] shadow-xs space-y-8">
          <div className="border-b border-[#E8DAC8] pb-4">
            <p className="eyebrow-label mb-1">AUTOMATED PIPELINE</p>
            <h2 className="text-2xl font-extrabold text-[#1F1F1F]">
              Inspection Digitization <span className="text-[#C8452A]">Workflow</span>
            </h2>
            <p className="text-xs text-[#7A746E]">End-to-end data entry to downloadable Excel report execution.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 text-xs">
            <div className="p-5 bg-[#F3E6D3] rounded-[20px] space-y-2 border border-[#E8DAC8]">
              <span className="text-xs font-black text-[#C8452A]">STEP 01</span>
              <h4 className="font-bold text-[#1F1F1F]">QA Data Entry</h4>
              <p className="text-[#4A4540]">QA enters PO details, answers 22 checklist items, and captures photo evidence.</p>
            </div>

            <div className="p-5 bg-[#F3E6D3] rounded-[20px] space-y-2 border border-[#E8DAC8]">
              <span className="text-xs font-black text-[#C8452A]">STEP 02</span>
              <h4 className="font-bold text-[#1F1F1F]">Database Sync</h4>
              <p className="text-[#4A4540]">Data automatically autosaves to draft records and syncs measurements securely.</p>
            </div>

            <div className="p-5 bg-[#F3E6D3] rounded-[20px] space-y-2 border border-[#E8DAC8]">
              <span className="text-xs font-black text-[#C8452A]">STEP 03</span>
              <h4 className="font-bold text-[#1F1F1F]">Excel Population</h4>
              <p className="text-[#4A4540]">Clones master template, embeds images into cells, and computes AQL results.</p>
            </div>

            <div className="p-5 bg-[#F3E6D3] rounded-[20px] space-y-2 border border-[#E8DAC8]">
              <span className="text-xs font-black text-[#C8452A]">STEP 04</span>
              <h4 className="font-bold text-[#1F1F1F]">Instant Download</h4>
              <p className="text-[#4A4540]">QA auditor downloads the completed .xlsx report ready for brand delivery.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
