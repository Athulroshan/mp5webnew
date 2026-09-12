'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileSpreadsheet,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Download,
  Camera,
  Layers,
  AlertTriangle,
  FileCheck,
  Building,
  Calendar,
  User,
  Tag,
  CheckCircle2,
  RefreshCw,
  PackageCheck,
  Truck,
  ListChecks,
} from 'lucide-react';
import { PhotoUploader } from './photo-uploader';
import { MeasurementChart, MeasurementRow } from './measurement-chart';
import { DefectManager, DefectItem } from './defect-manager';
import { ChecklistSection, ChecklistItem, default22Questions } from './checklist-section';

interface QAStepperProps {
  initialData?: any;
}

export function QAStepperWizard({ initialData }: QAStepperProps) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [downloadInfo, setDownloadInfo] = useState<{ url: string; filename: string; number: string } | null>(null);

  // Form State
  const [inspectionId, setInspectionId] = useState<string>(initialData?.id || '');
  const [inspectionNumber, setInspectionNumber] = useState<string>(initialData?.inspectionNumber || 'INS-2026-00001');

  // Section 1: Basic Details
  const [poNumber, setPoNumber] = useState(initialData?.poNumber || 'PO4500159665');
  const [poQuantity, setPoQuantity] = useState(initialData?.poQuantity || 2600);
  const [inspectionQuantity, setInspectionQuantity] = useState(initialData?.inspectionQuantity || 125);
  const [factoryName, setFactoryName] = useState(initialData?.factoryName || 'JRP EXPORTS');
  const [agentName, setAgentName] = useState(initialData?.agentName || 'MPSS Sourcing');
  const [season, setSeason] = useState(initialData?.season || 'SUMMER');
  const [buyerBrand, setBuyerBrand] = useState(initialData?.buyerBrand || 'MPSS Brands');
  const [styleNumber, setStyleNumber] = useState(initialData?.styleNumber || 'TS-9092');
  const [productDescription, setProductDescription] = useState(
    initialData?.productDescription || "Men's Crew Neck 100% Cotton Polo T-Shirt"
  );
  const [inspectionDate, setInspectionDate] = useState(
    initialData?.inspectionDate || new Date().toISOString().split('T')[0]
  );
  const [inspectorName, setInspectorName] = useState(initialData?.inspectorName || 'John Doe (QA Auditor)');

  // Section 2: Shipment & Carton Details
  const [inspectionType, setInspectionType] = useState('Pre-Shipment Inspection (FRI)');
  const [sampleType, setSampleType] = useState('Bulk Production');
  const [totalCartons, setTotalCartons] = useState(130);
  const [requiredCartons, setRequiredCartons] = useState(14);
  const [shippedCartons, setShippedCartons] = useState(130);
  const [openedCartons, setOpenedCartons] = useState(14);

  // Section 3: 22 Items to Check
  const [itemsToCheck, setItemsToCheck] = useState<ChecklistItem[]>(
    initialData?.itemsToCheck ? JSON.parse(initialData.itemsToCheck) : default22Questions.map((q, i) => ({
      id: i + 1,
      question: q,
      status: 'YES',
      comment: 'Conforms to approved standard sample'
    }))
  );

  // Section 4: Measurements
  const [measurements, setMeasurements] = useState<MeasurementRow[]>(
    initialData?.measurements || [
      { measurementPoint: 'Chest Width', specRequired: '52.0 cm', tolerance: '±1.0 cm', actualValues: ['52.0', '52.5', '51.8', '52.0', '52.2'], result: 'PASS' },
      { measurementPoint: 'Body Length', specRequired: '72.0 cm', tolerance: '±1.5 cm', actualValues: ['72.0', '72.2', '71.9', '72.1', '72.0'], result: 'PASS' },
      { measurementPoint: 'Sleeve Length', specRequired: '22.0 cm', tolerance: '±0.8 cm', actualValues: ['22.0', '22.1', '21.9', '22.0', '22.0'], result: 'PASS' },
      { measurementPoint: 'Shoulder Width', specRequired: '46.0 cm', tolerance: '±1.0 cm', actualValues: ['46.0', '46.2', '45.9', '46.0', '46.1'], result: 'PASS' },
      { measurementPoint: 'Neck Width', specRequired: '18.0 cm', tolerance: '±0.5 cm', actualValues: ['18.0', '18.1', '18.0', '17.9', '18.0'], result: 'PASS' },
      { measurementPoint: 'Bottom Hem', specRequired: '52.0 cm', tolerance: '±1.0 cm', actualValues: ['52.0', '52.1', '51.9', '52.0', '52.0'], result: 'PASS' },
    ]
  );

  // Photos state
  const [photos, setPhotos] = useState<any[]>(initialData?.photos || []);

  // Section 6: Defects
  const [defects, setDefects] = useState<DefectItem[]>(initialData?.defects || []);

  // Section 7: Audit Decisions & Comments
  const [visualAuditResult, setVisualAuditResult] = useState(initialData?.visualAuditResult || 'PASS');
  const [packingAuditResult, setPackingAuditResult] = useState(initialData?.packingAuditResult || 'PASS');
  const [overallResult, setOverallResult] = useState(initialData?.overallResult || 'PASS');
  const [comments, setComments] = useState(
    initialData?.comments || 'No critical defects found during visual and packing inspection. Order conforms to AQL 2.5 standards.'
  );

  // Ref to track in-flight saves and current inspectionId to prevent duplicate creates on rapid autosave
  const inspectionIdRef = React.useRef<string>(initialData?.id || '');
  const saveInFlightRef = React.useRef<Promise<any> | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    if (initialData?.id) {
      inspectionIdRef.current = initialData.id;
      setInspectionId(initialData.id);
    }
  }, [initialData?.id]);

  const saveDraft = async (): Promise<{ inspection?: any; error?: string; rejectedFields?: string[] }> => {
    // If a save is already in-flight, wait for it before starting next update
    if (saveInFlightRef.current) {
      try {
        await saveInFlightRef.current;
      } catch (e) {}
    }

    const executeSave = async () => {
      setSaving(true);
      setValidationError('');
      const currentId = inspectionIdRef.current || inspectionId || undefined;

      const payload = {
        id: currentId,
        poNumber,
        poQuantity,
        inspectionQuantity,
        factoryName,
        agentName,
        season,
        buyerBrand,
        styleNumber,
        productDescription,
        inspectionDate,
        inspectorName,
        visualAuditResult,
        packingAuditResult,
        overallResult,
        comments,
        itemsToCheck,
        shipmentDetails: { inspectionType, sampleType, totalCartons, requiredCartons, shippedCartons, openedCartons },
        measurements,
        defects,
        photos,
        status: 'draft',
      };

      try {
        // Use PATCH if id exists, POST if creating fresh for first time
        const endpoint = currentId ? `/api/inspections/${currentId}` : '/api/inspections';
        const method = currentId ? 'PATCH' : 'POST';

        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          const errMsg = data.error || `Server responded with HTTP status ${res.status}`;
          console.error('[AUTOSAVE BACKEND REJECTION] Backend rejected save:', {
            status: res.status,
            error: errMsg,
            rejectedFields: data.rejectedFields,
            payload,
          });
          setValidationError(errMsg);
          return { error: errMsg, rejectedFields: data.rejectedFields || [] };
        }

        if (data.inspection) {
          inspectionIdRef.current = data.inspection.id;
          setInspectionId(data.inspection.id);
          setInspectionNumber(data.inspection.inspectionNumber);
          setLastSavedTime(new Date().toLocaleTimeString());
          return { inspection: data.inspection };
        }
        return { error: 'Unknown response structure from server' };
      } catch (err: any) {
        console.error('[AUTOSAVE NETWORK ERROR]', err);
        const errStr = err?.message || 'Network connection failed';
        setValidationError(errStr);
        return { error: errStr };
      } finally {
        setSaving(false);
      }
    };

    const promise = executeSave();
    saveInFlightRef.current = promise;
    const result = await promise;
    saveInFlightRef.current = null;
    return result;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (poNumber || factoryName) {
        saveDraft();
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [
    poNumber, poQuantity, inspectionQuantity, factoryName, agentName, season, buyerBrand,
    styleNumber, productDescription, inspectionDate, inspectorName, visualAuditResult,
    packingAuditResult, overallResult, comments, itemsToCheck, measurements, defects, photos
  ]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const saveResult = await saveDraft();
      
      if (saveResult.error) {
        console.error('[GENERATE REPORT BLOCKED] Save draft failed before report generation:', saveResult.error);
        alert(`Cannot generate report. Draft save failed with backend error:\n\n${saveResult.error}\n\nPlease check the required fields and try again.`);
        setGenerating(false);
        return;
      }

      const targetId = saveResult.inspection?.id || inspectionIdRef.current || inspectionId;

      if (!targetId) {
        alert('Could not determine inspection ID for report generation. Please verify required fields.');
        setGenerating(false);
        return;
      }

      const res = await fetch(`/api/inspections/${targetId}/generate-excel`, {
        method: 'POST',
      });

      if (!res.ok) {
        const errText = await res.text();
        let errMsg = `HTTP Error ${res.status}`;
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error) errMsg = parsed.error;
        } catch (e) {}
        alert(`Failed to generate report: ${errMsg}`);
        setGenerating(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        router.push(`/inspections/${targetId}/preview`);
      } else {
        alert(`Failed to generate report: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error generating report:', err);
      alert(`Error generating report file: ${err?.message || 'Server connection error'}`);
    } finally {
      setGenerating(false);
    }
  };

  const sectionsList = [
    { num: 1, title: '1. Basic Details' },
    { num: 2, title: '2. Shipment' },
    { num: 3, title: '3. Items to Check' },
    { num: 4, title: '4. Measurement' },
    { num: 5, title: '5. Photos' },
    { num: 6, title: '6. Defects & CAP' },
    { num: 7, title: '7. Final Audit' },
    { num: 8, title: '8. Review & Submit' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navbar & Autosave Bar */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/inspections')}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                {inspectionNumber}
              </span>
              <h2 className="text-sm sm:text-base font-extrabold truncate">
                {poNumber ? `PO: ${poNumber}` : 'New Inspection Entry'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  Autosaving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-emerald-500" />
                  {lastSavedTime ? `Draft saved ${lastSavedTime}` : 'Draft ready'}
                </>
              )}
            </div>

            <button
              onClick={saveDraft}
              disabled={saving}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl transition"
            >
              Save Draft
            </button>
          </div>
        </div>

        {/* Stepper Progress Indicator (Section 1 of 8) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-blue-600 dark:text-blue-400">Section {step} of 8</span>
            <span className="text-slate-500">{Math.round((step / 8) * 100)}% Complete</span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 8) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between overflow-x-auto pt-1 gap-2 min-w-[600px]">
            {sectionsList.map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                  step === s.num
                    ? 'bg-blue-600 text-white'
                    : step > s.num
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* GOOGLE-FORM-STYLE SECTION PANELS */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[420px]">
          {/* SECTION 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Section 1 — Basic Inspection Details</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter PO and core report parameters. Values populate the Audit worksheet.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PO Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PO4500159665"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PO Quantity (Units)
                  </label>
                  <input
                    type="number"
                    value={poQuantity}
                    onChange={(e) => setPoQuantity(Number(e.target.value) || 0)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Inspection / Sample Qty
                  </label>
                  <input
                    type="number"
                    value={inspectionQuantity}
                    onChange={(e) => setInspectionQuantity(Number(e.target.value) || 0)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Factory Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JRP EXPORTS"
                    value={factoryName}
                    onChange={(e) => setFactoryName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MPSS Sourcing"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Season
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SUMMER / AW26"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Buyer / Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MPSS Brands"
                    value={buyerBrand}
                    onChange={(e) => setBuyerBrand(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Style Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TS-9092"
                    value={styleNumber}
                    onChange={(e) => setStyleNumber(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Inspection Date
                  </label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Men Crew Neck 100% Cotton Polo T-Shirt"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  QA / Inspector Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe (QA Auditor)"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* SECTION 2: Order & Shipment Details */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Section 2 — Order & Shipment Details</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter carton breakdown, sample type, and shipment information.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type of Inspection
                  </label>
                  <select
                    value={inspectionType}
                    onChange={(e) => setInspectionType(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Pre-Shipment Inspection (FRI)">Pre-Shipment Inspection (FRI)</option>
                    <option value="In-Line Audit">In-Line Audit</option>
                    <option value="Mid-Inspection">Mid-Inspection</option>
                    <option value="Container Loading Check">Container Loading Check</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type of Sample / Order
                  </label>
                  <select
                    value={sampleType}
                    onChange={(e) => setSampleType(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Bulk Production">Bulk Production</option>
                    <option value="TOP Sample">TOP Sample</option>
                    <option value="Sales Sample">Sales Sample</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Cartons
                  </label>
                  <input
                    type="number"
                    value={totalCartons}
                    onChange={(e) => setTotalCartons(Number(e.target.value) || 0)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Required Cartons to Audit
                  </label>
                  <input
                    type="number"
                    value={requiredCartons}
                    onChange={(e) => setRequiredCartons(Number(e.target.value) || 0)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shipped Cartons
                  </label>
                  <input
                    type="number"
                    value={shippedCartons}
                    onChange={(e) => setShippedCartons(Number(e.target.value) || 0)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Opened Cartons
                  </label>
                  <input
                    type="number"
                    value={openedCartons}
                    onChange={(e) => setOpenedCartons(Number(e.target.value) || 0)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: 22 Items to Check */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Section 3 — Items to Check (Quality Checklist)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Answer the 22 standard inspection questions. Values map to Audit worksheet.
                </p>
              </div>

              <ChecklistSection items={itemsToCheck} onChange={setItemsToCheck} />
            </div>
          )}

          {/* SECTION 4: Measurement Audit */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Section 4 — Garment Measurement Audit</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload physical measurement chart photo and enter actual sample readings.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <PhotoUploader
                  photos={photos.filter((p) => p.type === 'measurement')}
                  onChange={(mPhotos) => {
                    const nonMeasurement = photos.filter((p) => p.type !== 'measurement');
                    setPhotos([...nonMeasurement, ...mPhotos]);
                  }}
                  type="measurement"
                  single={true}
                  title="Upload Physical Measurement Chart Photo"
                  subtitle="Image will be embedded directly into the MEASURE sheet in Excel"
                />
              </div>

              <MeasurementChart measurements={measurements} onChange={setMeasurements} />
            </div>
          )}

          {/* SECTION 5: Inspection Photos */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Section 5 — Inspection Photos</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Take photos using your phone camera. Images are inserted into the Inspection photos worksheet.
                </p>
              </div>

              <PhotoUploader
                photos={photos.filter((p) => p.type === 'inspection')}
                onChange={(iPhotos) => {
                  const nonInspection = photos.filter((p) => p.type !== 'inspection');
                  setPhotos([...nonInspection, ...iPhotos]);
                }}
                type="inspection"
                title="Inspection Photo Gallery"
                subtitle="Embedded in a 4-column structured photo grid inside the Excel report"
              />
            </div>
          )}

          {/* SECTION 6: Defects & CAP Log */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Section 6 — Defects & Corrective Action Plan (CAP)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Log defects and attach photos. Details populate the Defects photos and CAP worksheets.
                </p>
              </div>

              <DefectManager
                defects={defects}
                onChange={setDefects}
                onPhotoAdd={(photoUrl, defectCode) => {
                  setPhotos([...photos, { type: 'defect', photoUrl, defectCode, description: `Defect ${defectCode}` }]);
                }}
              />
            </div>
          )}

          {/* SECTION 7: Final Audit & Comments */}
          {step === 7 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Section 7 — Final Audit Results & Comments</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Set visual audit, packing audit, overall result, and inspector final notes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Visual Audit</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVisualAuditResult('PASS')}
                      className={`py-2 text-xs font-bold rounded-lg border transition ${
                        visualAuditResult === 'PASS'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      PASS
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisualAuditResult('FAIL')}
                      className={`py-2 text-xs font-bold rounded-lg border transition ${
                        visualAuditResult === 'FAIL'
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      FAIL
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Packing Audit</label>
                  <div className="grid grid-cols-3 gap-1">
                    {['PASS', 'FAIL', 'ON HOLD'].map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => setPackingAuditResult(res)}
                        className={`py-2 text-[11px] font-bold rounded-lg border transition ${
                          packingAuditResult === res
                            ? res === 'FAIL'
                              ? 'bg-red-600 text-white border-red-600'
                              : res === 'ON HOLD'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Overall Result</label>
                  <div className="grid grid-cols-3 gap-1">
                    {['PASS', 'FAIL', 'ON HOLD'].map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => setOverallResult(res)}
                        className={`py-2 text-[11px] font-bold rounded-lg border transition ${
                          overallResult === res
                            ? res === 'FAIL'
                              ? 'bg-red-600 text-white border-red-600'
                              : res === 'ON HOLD'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Final Inspector Comments
                </label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter final inspection notes..."
                  className="w-full text-xs p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>
            </div>
          )}

          {/* SECTION 8: Review & Submit */}
          {step === 8 && !downloadInfo && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Section 8 — Final Review & Submission</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Google-Form-style summary review before generating the official Master Excel Report.
                </p>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-slate-400 block">Inspection ID</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{inspectionNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">PO Number</span>
                    <span className="font-bold">{poNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">PO / Sample Qty</span>
                    <span className="font-bold">{poQuantity} / {inspectionQuantity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Factory</span>
                    <span className="font-bold">{factoryName}</span>
                  </div>
                </div>

                <hr className="border-slate-200 dark:border-slate-700" />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-slate-400 block">22 Checklist Items</span>
                    <span className="font-bold text-emerald-600">All 22 Completed</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Inspection Photos</span>
                    <span className="font-bold">{photos.filter((p) => p.type === 'inspection').length} photos</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Defects Logged</span>
                    <span className="font-bold text-red-600">{defects.length} defects</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Overall Result</span>
                    <span className="font-extrabold text-emerald-600">{overallResult}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-200 transition"
                >
                  BACK / EDIT
                </button>

                <button
                  type="button"
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      GENERATING EXCEL WORKBOOK...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-5 h-5" />
                      SUBMIT & GENERATE EXCEL REPORT
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Download Modal / Screen */}
          {step === 8 && downloadInfo && (
            <div className="space-y-6 text-center py-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full uppercase tracking-wider">
                  Report Generated Successfully
                </span>
                <h2 className="text-2xl font-black mt-3">Inspection {downloadInfo.number}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Populated all 19 worksheets in the Master Excel Template with actual photos, formulas, and checklist answers.
                </p>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md mx-auto space-y-3">
                <a
                  href={`/api/inspections/${inspectionId}/download`}
                  download={downloadInfo.filename}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition"
                >
                  <Download className="w-5 h-5" />
                  DOWNLOAD COMPLETED EXCEL
                </a>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Preserves all 19 original worksheets, formatting, and embedded images</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => router.push('/inspections')}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-200 transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Stepper Controls */}
        {step < 8 && (
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-xs font-extrabold rounded-xl hover:bg-blue-700 active:scale-95 transition"
            >
              Next Section
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
