'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileSpreadsheet,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Download,
  Camera,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Eye,
  Sliders,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  PenTool,
  ShieldAlert,
  ClipboardList,
  Layers,
  Building,
  Calendar,
  User,
  Truck,
  Box,
  Percent,
} from 'lucide-react';
import { useUser } from '@/lib/user-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface DefectItem {
  id: string | number;
  colour?: string;
  defectCode: string;
  description: string;
  severity: 'Critical' | 'Major' | 'Minor';
  quantity: number;
  commentsMpss?: string;
  commentsFactory?: string;
  photoUrl?: string;
}

export interface PhotoBoxItem {
  id: number;
  photoUrl: string;
  name: string;
}

interface QAStepperProps {
  initialData?: any;
}

/**
 * Resize image client-side to max 1400px before upload for snappy performance.
 */
function resizeImage(file: File, maxDim = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(e.target?.result as string);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 22 Checkpoints from the Master Template
export const MASTER_22_CHECKPOINTS = [
  'Approved Prod Spec - BOM',
  'Main & Care Label',
  'Carton Label Placement',
  'Carton Label Barcode Printable & Scannable',
  'Wide Goods per Approved',
  'Trims - Components per Approved',
  'Fabric Weight',
  'TOP Samples Pulled Out from the Bulk',
  'Fabric Color',
  'Moisture Level Test',
  'Metal Detection Check',
  'Packing Method',
  'Hanging Method',
  'Correct Carton Used',
  'Cartons Too Empty / Overloaded / Damaged',
  'UPC / Barcode',
  'Hang / Collar Tags',
  'Draw String Review',
  'Sharp Points & Sharp Edges',
  'Small Parts',
  'Smell Check',
  'Lab Test Report',
];

// Touch / Mouse Canvas Signature Pad Component
function SignaturePad({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = value;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [value]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    isDrawing.current = true;
    canvas.setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-blue-500" />
          <span>{label}</span>
        </label>
        {value && (
          <button
            type="button"
            onClick={clear}
            className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
      <div className="relative border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-inner">
        <canvas
          ref={canvasRef}
          width={320}
          height={110}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          className="w-full h-[110px] touch-none cursor-crosshair bg-transparent"
        />
        {!value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic">
            Sign here with mouse or finger
          </div>
        )}
      </div>
    </div>
  );
}

export function QAStepperWizard({ initialData }: QAStepperProps) {
  const router = useRouter();

  // Active Tab: 1 = Audit, 2 = Packing list, 3 = Measure, 4 = Inspection photos, 5 = Defects photos
  const [activeTab, setActiveTab] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  // Primary identifiers
  const [inspectionId, setInspectionId] = useState<string>(initialData?.id || '');
  const [inspectionNumber, setInspectionNumber] = useState<string>(
    initialData?.inspectionNumber || 'FI_MPSS_...'
  );

  // Role permissions & Clear all dialog state
  const { user } = useUser();
  const [canWrite, setCanWrite] = useState<boolean>(true);
  const [clearDialogOpen, setClearDialogOpen] = useState<boolean>(false);
  const isClearedRef = useRef<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user') || localStorage.getItem('user_profile');
      const u = stored ? JSON.parse(stored) : user;
      if (u) {
        const role = (u.role || '').toLowerCase();
        const hasPermission =
          role === 'admin' ||
          role === 'inspector' ||
          role === 'garment quality auditor' ||
          role.includes('admin') ||
          role.includes('inspector') ||
          role.includes('auditor');
        setCanWrite(Boolean(hasPermission && u.approved !== false));
      } else {
        setCanWrite(false);
      }
    } catch {
      setCanWrite(true);
    }
  }, [user]);

  // ---------------------------------------------------------------------------
  // TAB 1: AUDIT STATE (Matching Audit sheet top-to-bottom)
  // ---------------------------------------------------------------------------
  const [productDescription, setProductDescription] = useState(
    initialData?.productDescription || "Men Crew Neck 100% Cotton Polo T-Shirt"
  );
  const [inspectionDate, setInspectionDate] = useState(
    initialData?.inspectionDate || new Date().toISOString().split('T')[0]
  );
  const [inspectionTeam, setInspectionTeam] = useState(
    initialData?.agentName || 'My Profile Sourcing Solutions'
  );
  const [customer, setCustomer] = useState(initialData?.buyerBrand || 'CAGI');
  const [account, setAccount] = useState('MENS');
  const [merchandiser, setMerchandiser] = useState('DHANAPAL');
  const [factoryName, setFactoryName] = useState(initialData?.factoryName || 'JRP EXPORTS');
  const [factoryLocation, setFactoryLocation] = useState('SEYENTHAMPALAYAM');
  const [countryOfOrigin, setCountryOfOrigin] = useState('INDIA');
  const [styleNumber, setStyleNumber] = useState(initialData?.styleNumber || 'YCAT0110');
  const [poNumber, setPoNumber] = useState(initialData?.poNumber || '4500159665');
  const [poQuantity, setPoQuantity] = useState(initialData?.poQuantity || 2600);
  const [season, setSeason] = useState(initialData?.season || 'SUMMER');
  const [colorWays, setColorWays] = useState('WHITE');
  const [size, setSize] = useState('M,L,XL');
  const [shipmentDate, setShipmentDate] = useState(
    initialData?.inspectionDate || new Date().toISOString().split('T')[0]
  );
  const [inspectorName, setInspectorName] = useState(
    initialData?.inspectorName || 'John Doe (QA Auditor)'
  );

  // Type Matrix & Shipping
  const [sampleType, setSampleType] = useState('Fit / Size Set Sample');
  const [inspectionType, setInspectionType] = useState('1st Batch | Pre-Final');
  const [orderType, setOrderType] = useState('Replenishment');
  const [shipBy, setShipBy] = useState<'Sea' | 'Air'>('Sea');
  const [totalCartons, setTotalCartons] = useState(53);
  const [qtyShipped, setQtyShipped] = useState(2592);
  const [qtyAvailable, setQtyAvailable] = useState(2600);

  // AQL Settings
  const [inspectionLevel, setInspectionLevel] = useState<'I' | 'II' | 'III'>('II');
  const [inspectedQty, setInspectedQty] = useState(initialData?.inspectionQuantity || 125);
  const [criticalAccept, setCriticalAccept] = useState('0');
  const [majorAccept, setMajorAccept] = useState('7 / 8');
  const [minorAccept, setMinorAccept] = useState('10 / 11');

  // Items to Check (22 template questions)
  const [itemsToCheck, setItemsToCheck] = useState<any[]>(() => {
    if (initialData?.itemsToCheck) {
      try {
        const parsed = typeof initialData.itemsToCheck === 'string'
          ? JSON.parse(initialData.itemsToCheck)
          : initialData.itemsToCheck;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return MASTER_22_CHECKPOINTS.map((text, i) => ({
      id: i + 1,
      question: text,
      status: 'YES',
      comment: 'Conforms to approved standard sample',
    }));
  });

  // Defect Classification Table
  const [defects, setDefects] = useState<DefectItem[]>(() => {
    if (initialData?.defects && Array.isArray(initialData.defects) && initialData.defects.length > 0) {
      return initialData.defects.map((d: any, idx: number) => ({
        id: d.id || idx + 1,
        colour: d.location || 'WHITE',
        defectCode: d.defectCode || `DEF-00${idx + 1}`,
        description: d.description || '',
        severity: (d.severity as any) || 'Major',
        quantity: Number(d.quantity) || 1,
        commentsMpss: d.commentsMpss || '',
        commentsFactory: d.commentsFactory || '',
        photoUrl: d.photoUrl || '',
      }));
    }
    return [
      {
        id: 1,
        colour: 'WHITE',
        defectCode: 'DEF-001',
        description: 'Poor pressing on XXL size need to correct before shipping the goods',
        severity: 'Major',
        quantity: 2,
        commentsMpss: 'Re-press 100% of XXL',
        commentsFactory: 'Agreed, in progress',
      },
      {
        id: 2,
        colour: 'WHITE',
        defectCode: 'DEF-002',
        description: 'Loose threads at bottom hem',
        severity: 'Minor',
        quantity: 3,
        commentsMpss: 'Trim threads',
        commentsFactory: 'Completed',
      },
    ];
  });

  // Production Status
  const [cuttingPercent, setCuttingPercent] = useState('100%');
  const [sewingPercent, setSewingPercent] = useState('100%');
  const [trimmingPercent, setTrimmingPercent] = useState('100%');
  const [packedPercent, setPackedPercent] = useState('95%');
  const [totalCartonQty, setTotalCartonQty] = useState('53');
  const [cartonsPacked, setCartonsPacked] = useState('53');

  // Comments
  const [comments, setComments] = useState(
    initialData?.comments ||
      'No critical defects found during visual and packing inspection. Order conforms to AQL 2.5 standards.'
  );

  // Measurement Summary
  const [measurementResult, setMeasurementResult] = useState<'PASS' | 'FAIL' | 'N/A'>('PASS');
  const [measurementSampleSize, setMeasurementSampleSize] = useState('14');
  const [maxAllowedPoints, setMaxAllowedPoints] = useState('5');
  const [totalPomPoints, setTotalPomPoints] = useState('28');
  const [defectivePointsFound, setDefectivePointsFound] = useState('0');
  const [sampleSizeCriteria, setSampleSizeCriteria] = useState('ANSI/ASQ Z1.4');
  const [measurementComment, setMeasurementComment] = useState('All POM points meet specified tolerances');

  const [othersComment, setOthersComment] = useState('Goods are inspected under D65 artificial light table');
  const [selectedCartons, setSelectedCartons] = useState('Ctn # 04, 12, 19, 28, 45, 52');

  // Signatures (3 required blocks)
  const [mpssQcName, setMpssQcName] = useState(initialData?.inspectorName || 'John Doe');
  const [mpssQcSignature, setMpssQcSignature] = useState('');
  const [approvedByName, setApprovedByName] = useState('QA Manager');
  const [approvedBySignature, setApprovedBySignature] = useState('');
  const [supplierRepName, setSupplierRepName] = useState('Factory Representative');
  const [supplierRepSignature, setSupplierRepSignature] = useState('');

  // Result Override
  const [overrideResult, setOverrideResult] = useState<string>('');

  // ---------------------------------------------------------------------------
  // TAB 2: PACKING LIST STATE
  // ---------------------------------------------------------------------------
  const pList = initialData?.shipmentDetails?.packingList || {};
  const [packingListDate, setPackingListDate] = useState(
    pList.date || initialData?.inspectionDate || new Date().toISOString().split('T')[0]
  );
  const [packingListStyle, setPackingListStyle] = useState(
    pList.style || initialData?.styleNumber || 'YCAT0110'
  );
  const [packingListOrderQty, setPackingListOrderQty] = useState(
    pList.orderQty || (initialData?.poQuantity ? String(initialData.poQuantity) : '2600')
  );
  const [packingListFactory, setPackingListFactory] = useState(
    pList.factory || initialData?.factoryName || 'JRP EXPORTS'
  );
  const [packingListPo, setPackingListPo] = useState(
    pList.po || initialData?.poNumber || '4500159665'
  );
  const [packingListCutQty, setPackingListCutQty] = useState(
    pList.cutQty || '2600'
  );
  const [packingListLocation, setPackingListLocation] = useState(
    pList.location || 'SEYENTHAMPALAYAM'
  );
  const [packingListColours, setPackingListColours] = useState(
    pList.colours || 'WHITE'
  );
  const [packingListShipQty, setPackingListShipQty] = useState(
    pList.shipQty || '2592'
  );
  const [packingListPhotos, setPackingListPhotos] = useState<string[]>(() => {
    if (initialData?.photos && Array.isArray(initialData.photos)) {
      const matched = initialData.photos
        .filter((p: any) => p.type === 'packing')
        .map((p: any) => p.photoUrl)
        .filter(Boolean);
      if (matched.length > 0) return matched;
    }
    if (Array.isArray(initialData?.shipmentDetails?.packingListPhotos)) {
      return initialData.shipmentDetails.packingListPhotos;
    }
    return [];
  });

  // ---------------------------------------------------------------------------
  // TAB 3: MEASURE STATE
  // ---------------------------------------------------------------------------
  const mData = initialData?.shipmentDetails?.measure || {};
  const [measureFactory, setMeasureFactory] = useState(
    mData.factory || initialData?.factoryName || 'JRP EXPORTS'
  );
  const [measureVpnStyle, setMeasureVpnStyle] = useState(
    mData.vpnStyle || initialData?.styleNumber || 'YCAT0110'
  );
  const [measurePo, setMeasurePo] = useState(
    mData.purchaseOrder || initialData?.poNumber || '4500159665'
  );
  const [measureStyleDesc, setMeasureStyleDesc] = useState(
    mData.styleDesc || initialData?.productDescription || 'Men Crew Neck 100% Cotton Polo T-Shirt'
  );
  const [measureAuditDate, setMeasureAuditDate] = useState(
    mData.auditDate || initialData?.inspectionDate || new Date().toISOString().split('T')[0]
  );
  const [measurePhotos, setMeasurePhotos] = useState<string[]>(() => {
    if (initialData?.photos && Array.isArray(initialData.photos)) {
      const matched = initialData.photos
        .filter((p: any) => p.type === 'measurement')
        .map((p: any) => p.photoUrl)
        .filter(Boolean);
      if (matched.length > 0) return matched;
    }
    if (Array.isArray(initialData?.shipmentDetails?.measurePhotos)) {
      return initialData.shipmentDetails.measurePhotos;
    }
    return [];
  });

  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // TAB 4: INSPECTION PHOTOS STATE (starts with 12 boxes, 4 per row / 2 mobile)
  // ---------------------------------------------------------------------------
  const [inspectionBoxes, setInspectionBoxes] = useState<PhotoBoxItem[]>(() => {
    const existing = (initialData?.photos || []).filter((p: any) => p.type === 'inspection');
    const initialCount = Math.max(12, Math.ceil(existing.length / 4) * 4 || 12);
    const boxes: PhotoBoxItem[] = [];
    for (let i = 0; i < initialCount; i++) {
      boxes.push({
        id: i + 1,
        photoUrl: existing[i]?.photoUrl || '',
        name: existing[i]?.description || String(i + 1),
      });
    }
    return boxes;
  });

  // ---------------------------------------------------------------------------
  // TAB 5: DEFECTS PHOTOS STATE (starts with 8 boxes, suggests Nth defect)
  // ---------------------------------------------------------------------------
  const [defectBoxes, setDefectBoxes] = useState<PhotoBoxItem[]>(() => {
    const existing = (initialData?.photos || []).filter(
      (p: any) => p.type === 'defect' || p.defectCode
    );
    const initialCount = Math.max(8, Math.ceil(existing.length / 4) * 4 || 8);
    const boxes: PhotoBoxItem[] = [];
    for (let i = 0; i < initialCount; i++) {
      boxes.push({
        id: i + 1,
        photoUrl: existing[i]?.photoUrl || '',
        name: existing[i]?.description || (defects[i]?.description ? defects[i].description : `Defect ${i + 1}`),
      });
    }
    return boxes;
  });

  // Autosave references
  const inspectionIdRef = useRef<string>(initialData?.id || '');
  const saveInFlightRef = useRef<Promise<any> | null>(null);

  // Sync ref
  useEffect(() => {
    if (initialData?.id) {
      inspectionIdRef.current = initialData.id;
      setInspectionId(initialData.id);
      if (initialData.inspectionNumber) {
        setInspectionNumber(initialData.inspectionNumber);
      }
    }
  }, [initialData]);

  // Keep packing and measure pre-filled from Audit if empty
  useEffect(() => {
    if (!packingListStyle) setPackingListStyle(styleNumber);
    if (!packingListFactory) setPackingListFactory(factoryName);
    if (!packingListPo) setPackingListPo(poNumber);
    if (!packingListOrderQty) setPackingListOrderQty(String(poQuantity));
    if (!packingListLocation) setPackingListLocation(factoryLocation);
    if (!packingListColours) setPackingListColours(colorWays);
    if (!packingListDate) setPackingListDate(inspectionDate);

    if (!measureFactory) setMeasureFactory(factoryName);
    if (!measureVpnStyle) setMeasureVpnStyle(styleNumber);
    if (!measurePo) setMeasurePo(poNumber);
    if (!measureStyleDesc) setMeasureStyleDesc(productDescription);
    if (!measureAuditDate) setMeasureAuditDate(inspectionDate);
  }, [styleNumber, factoryName, poNumber, poQuantity, factoryLocation, colorWays, inspectionDate, productDescription]);

  // ---------------------------------------------------------------------------
  // CALCULATED RESULT LOGIC (Strictly per user specification)
  // ---------------------------------------------------------------------------
  const criticalTotal = defects
    .filter((d) => d.severity === 'Critical')
    .reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
  const majorTotal = defects
    .filter((d) => d.severity === 'Major')
    .reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);
  const minorTotal = defects
    .filter((d) => d.severity === 'Minor')
    .reduce((sum, d) => sum + (Number(d.quantity) || 0), 0);

  // Parse accept limits
  const parsedMajorLimit = parseInt(majorAccept.split('/')[0] || majorAccept, 10);
  const parsedMinorLimit = parseInt(minorAccept.split('/')[0] || minorAccept, 10);

  let calculatedResult: 'PASSED' | 'FAILED' | 'PENDING' = 'PASSED';
  let calculationReason = '';

  if (criticalTotal >= 1) {
    calculatedResult = 'FAILED';
    calculationReason = `${criticalTotal} Critical defect(s) found (0 allowed)`;
  } else if (isNaN(parsedMajorLimit) || isNaN(parsedMinorLimit) || majorAccept.trim() === '' || minorAccept.trim() === '') {
    calculatedResult = 'PENDING';
    calculationReason = 'Major or minor accept limit is empty';
  } else if (majorTotal > parsedMajorLimit) {
    calculatedResult = 'FAILED';
    calculationReason = `Major total (${majorTotal}) exceeds ${parsedMajorLimit} allowed`;
  } else if (minorTotal > parsedMinorLimit) {
    calculatedResult = 'FAILED';
    calculationReason = `Minor total (${minorTotal}) exceeds ${parsedMinorLimit} allowed`;
  } else {
    calculatedResult = 'PASSED';
    calculationReason = `major ${majorTotal} of ${parsedMajorLimit}, minor ${minorTotal} of ${parsedMinorLimit} allowed`;
  }

  const effectiveResult = overrideResult ? overrideResult : calculatedResult;

  // ---------------------------------------------------------------------------
  // AUTOSAVE FUNCTIONALITY
  // ---------------------------------------------------------------------------
  const saveDraft = useCallback(async (): Promise<{ inspection?: any; error?: string }> => {
    if (saveInFlightRef.current) {
      try {
        await saveInFlightRef.current;
      } catch (e) {}
    }

    const executeSave = async () => {
      setSaving(true);
      setValidationError('');
      const currentId = inspectionIdRef.current || undefined;

      const combinedPhotos: any[] = [];
      inspectionBoxes.forEach((b) => {
        if (b.photoUrl) {
          combinedPhotos.push({
            type: 'inspection',
            photoUrl: b.photoUrl,
            description: b.name || String(b.id),
          });
        }
      });
      defectBoxes.forEach((b) => {
        if (b.photoUrl) {
          combinedPhotos.push({
            type: 'defect',
            photoUrl: b.photoUrl,
            description: b.name || `Defect ${b.id}`,
          });
        }
      });
      packingListPhotos.forEach((pUrl, i) => {
        combinedPhotos.push({
          type: 'packing',
          photoUrl: pUrl,
          description: `Packing List Doc #${i + 1}`,
        });
      });
      measurePhotos.forEach((pUrl, i) => {
        combinedPhotos.push({
          type: 'measurement',
          photoUrl: pUrl,
          description: `Measurement Chart #${i + 1}`,
        });
      });

      const payload = {
        id: currentId,
        poNumber,
        poQuantity: Number(poQuantity) || 0,
        inspectionQuantity: Number(inspectedQty) || 0,
        factoryName,
        agentName: inspectionTeam,
        season,
        buyerBrand: customer,
        styleNumber,
        productDescription,
        inspectionDate,
        inspectorName,
        visualAuditResult: effectiveResult,
        packingAuditResult: effectiveResult,
        overallResult: effectiveResult,
        comments,
        itemsToCheck,
        shipmentDetails: {
          account,
          merchandiser,
          factoryLocation,
          countryOfOrigin,
          colorWays,
          size,
          shipmentDate,
          sampleType,
          inspectionType,
          orderType,
          shipBy,
          totalCartons,
          qtyShipped,
          qtyAvailable,
          inspectionLevel,
          criticalAccept,
          majorAccept,
          minorAccept,
          criticalTotal,
          majorTotal,
          minorTotal,
          productionStatus: {
            cuttingPercent,
            sewingPercent,
            trimmingPercent,
            packedPercent,
            totalCartonQty,
            cartonsPacked,
          },
          measurementSummary: {
            result: measurementResult,
            sampleSize: measurementSampleSize,
            maxAllowedPoints,
            totalPomPoints,
            defectivePointsFound,
            sampleSizeCriteria,
            comment: measurementComment,
          },
          othersComment,
          selectedCartons,
          signatures: {
            mpssQcName,
            mpssQcSignature,
            approvedByName,
            approvedBySignature,
            supplierRepName,
            supplierRepSignature,
          },
          resultOverride: overrideResult,
          calculatedResult,
          calculationReason,
          packingList: {
            date: packingListDate,
            style: packingListStyle,
            orderQty: packingListOrderQty,
            factory: packingListFactory,
            po: packingListPo,
            cutQty: packingListCutQty,
            location: packingListLocation,
            colours: packingListColours,
            shipQty: packingListShipQty,
          },
          measure: {
            factory: measureFactory,
            vpnStyle: measureVpnStyle,
            purchaseOrder: measurePo,
            styleDesc: measureStyleDesc,
            auditDate: measureAuditDate,
          },
        },
        defects: defects.map((d) => ({
          defectCode: d.defectCode || '',
          description: d.description || '',
          location: d.colour || '',
          severity: d.severity || 'Major',
          quantity: Number(d.quantity) || 1,
          photoUrl: d.photoUrl || '',
          commentsMpss: d.commentsMpss || '',
          commentsFactory: d.commentsFactory || '',
        })),
        photos: combinedPhotos,
        status: 'draft',
      };

      try {
        const endpoint = currentId ? `/api/inspections/${currentId}` : '/api/inspections';
        const method = currentId ? 'PATCH' : 'POST';

        const res = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          const errMsg = data.error || `HTTP ${res.status}`;
          setValidationError(errMsg);
          return { error: errMsg };
        }

        if (data.inspection) {
          const returnedId = data.inspection.id;
          const returnedNum = data.inspection.inspectionNumber;

          inspectionIdRef.current = returnedId;
          setInspectionId(returnedId);
          setInspectionNumber(returnedNum);

          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setLastSavedTime(timeStr);

          if (typeof window !== 'undefined' && window.location.pathname === '/inspections/new') {
            window.history.replaceState(null, '', `/inspections/${returnedId}`);
          }

          return { inspection: data.inspection };
        }
        return { error: 'Unknown response' };
      } catch (err: any) {
        const msg = err?.message || 'Network error';
        setValidationError(msg);
        return { error: msg };
      } finally {
        setSaving(false);
      }
    };

    const promise = executeSave();
    saveInFlightRef.current = promise;
    const res = await promise;
    saveInFlightRef.current = null;
    return res;
  }, [
    inspectionNumber, poNumber, poQuantity, inspectedQty, factoryName, inspectionTeam,
    season, customer, styleNumber, productDescription, inspectionDate, inspectorName,
    effectiveResult, comments, itemsToCheck, account, merchandiser, factoryLocation,
    countryOfOrigin, colorWays, size, shipmentDate, sampleType, inspectionType, orderType,
    shipBy, totalCartons, qtyShipped, qtyAvailable, inspectionLevel, criticalAccept,
    majorAccept, minorAccept, criticalTotal, majorTotal, minorTotal, cuttingPercent,
    sewingPercent, trimmingPercent, packedPercent, totalCartonQty, cartonsPacked,
    measurementResult, measurementSampleSize, maxAllowedPoints, totalPomPoints,
    defectivePointsFound, sampleSizeCriteria, measurementComment, othersComment,
    selectedCartons, mpssQcName, mpssQcSignature, approvedByName, approvedBySignature,
    supplierRepName, supplierRepSignature, overrideResult, calculatedResult,
    calculationReason, packingListDate, packingListStyle, packingListOrderQty,
    packingListFactory, packingListPo, packingListCutQty, packingListLocation,
    packingListColours, packingListShipQty, packingListPhotos, measureFactory,
    measureVpnStyle, measurePo, measureStyleDesc, measureAuditDate, measurePhotos,
    inspectionBoxes, defectBoxes, defects
  ]);

  // Debounced Autosave (3.5 seconds after editing)
  useEffect(() => {
    if (isClearedRef.current) return;
    const timer = setTimeout(() => {
      saveDraft();
    }, 3500);
    return () => clearTimeout(timer);
  }, [
    poNumber, poQuantity, inspectedQty, factoryName, inspectionTeam, season, customer,
    styleNumber, productDescription, inspectionDate, inspectorName, effectiveResult,
    comments, itemsToCheck, shipBy, totalCartons, inspectionLevel, defects,
    cuttingPercent, sewingPercent, trimmingPercent, packedPercent, mpssQcSignature,
    approvedBySignature, supplierRepSignature, overrideResult, inspectionBoxes,
    defectBoxes, packingListPhotos, measurePhotos, saveDraft
  ]);

  const handleManualSave = () => {
    isClearedRef.current = false;
    saveDraft();
  };

  const handleClearAll = () => {
    isClearedRef.current = true;
    setClearDialogOpen(false);
    setValidationError('');

    // Tab 1: Audit
    setProductDescription('');
    setInspectionDate(new Date().toISOString().split('T')[0]);
    setInspectionTeam('');
    setCustomer('');
    setAccount('');
    setMerchandiser('');
    setFactoryName('');
    setFactoryLocation('');
    setCountryOfOrigin('');
    setStyleNumber('');
    setPoNumber('');
    setPoQuantity(0);
    setSeason('');
    setColorWays('');
    setSize('');
    setShipmentDate('');
    setInspectorName('');

    // Type Matrix & Shipping
    setSampleType('');
    setInspectionType('');
    setOrderType('');
    setShipBy('Sea');
    setTotalCartons(0);
    setQtyShipped(0);
    setQtyAvailable(0);

    // AQL Settings
    setInspectionLevel('II');
    setInspectedQty(0);
    setCriticalAccept('0');
    setMajorAccept('');
    setMinorAccept('');

    // Items to Check
    setItemsToCheck(
      MASTER_22_CHECKPOINTS.map((text, i) => ({
        id: i + 1,
        question: text,
        status: 'N/A',
        comment: '',
      }))
    );

    // Defects
    setDefects([]);

    // Production Status
    setCuttingPercent('');
    setSewingPercent('');
    setTrimmingPercent('');
    setPackedPercent('');
    setTotalCartonQty('');
    setCartonsPacked('');

    // Comments & findings
    setComments('');
    setOthersComment('');
    setSelectedCartons('');

    // Measurement Summary
    setMeasurementResult('N/A');
    setMeasurementSampleSize('');
    setMaxAllowedPoints('');
    setTotalPomPoints('');
    setDefectivePointsFound('');
    setSampleSizeCriteria('');
    setMeasurementComment('');

    // Signatures
    setMpssQcName('');
    setMpssQcSignature('');
    setApprovedByName('');
    setApprovedBySignature('');
    setSupplierRepName('');
    setSupplierRepSignature('');

    // Result override
    setOverrideResult('');

    // Tab 2: Packing List
    setPackingListDate('');
    setPackingListStyle('');
    setPackingListOrderQty('');
    setPackingListFactory('');
    setPackingListPo('');
    setPackingListCutQty('');
    setPackingListLocation('');
    setPackingListColours('');
    setPackingListShipQty('');
    setPackingListPhotos([]);

    // Tab 3: Measure
    setMeasureFactory('');
    setMeasureVpnStyle('');
    setMeasurePo('');
    setMeasureStyleDesc('');
    setMeasureAuditDate('');
    setMeasurePhotos([]);

    // Tab 4: Inspection Photos
    setInspectionBoxes(
      Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        photoUrl: '',
        name: String(i + 1),
      }))
    );

    // Tab 5: Defect Photos
    setDefectBoxes(
      Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        photoUrl: '',
        name: `Defect ${i + 1}`,
      }))
    );
  };

  // ---------------------------------------------------------------------------
  // DEFECT CLASSIFICATION TABLE HANDLERS
  // ---------------------------------------------------------------------------
  const addDefectRow = () => {
    const newId = Date.now();
    setDefects((prev) => [
      ...prev,
      {
        id: newId,
        colour: colorWays || 'WHITE',
        defectCode: `DEF-00${prev.length + 1}`,
        description: '',
        severity: 'Major',
        quantity: 1,
        commentsMpss: '',
        commentsFactory: '',
      },
    ]);
  };

  const removeDefectRow = (id: string | number) => {
    setDefects((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDefectRow = (id: string | number, patch: Partial<DefectItem>) => {
    setDefects((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  // ---------------------------------------------------------------------------
  // CHECKLIST ITEM HANDLERS (22 Items)
  // ---------------------------------------------------------------------------
  const updateChecklistItem = (id: number, status: 'YES' | 'NO' | 'N/A', comment?: string) => {
    setItemsToCheck((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status, ...(comment !== undefined ? { comment } : {}) }
          : item
      )
    );
  };

  // ---------------------------------------------------------------------------
  // PHOTO BOX HANDLERS (for Tabs 4 & 5)
  // ---------------------------------------------------------------------------
  const handleUploadPhoto = async (
    file: File,
    type: 'inspection' | 'defect',
    boxIndex: number
  ) => {
    try {
      const resizedBase64 = await resizeImage(file, 1400);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: resizedBase64 }),
      });
      const data = await res.json();
      if (data.url) {
        if (type === 'inspection') {
          setInspectionBoxes((prev) =>
            prev.map((b, i) => (i === boxIndex ? { ...b, photoUrl: data.url } : b))
          );
        } else {
          setDefectBoxes((prev) =>
            prev.map((b, i) => {
              if (i === boxIndex) {
                const suggested =
                  defects[i]?.description || b.name || `Defect ${i + 1}`;
                return { ...b, photoUrl: data.url, name: suggested };
              }
              return b;
            })
          );
        }
      } else {
        alert('Photo upload failed: ' + (data.error || 'Server error'));
      }
    } catch (e: any) {
      alert('Error uploading photo: ' + e?.message);
    }
  };

  const handleRemovePhoto = (type: 'inspection' | 'defect', boxIndex: number) => {
    if (type === 'inspection') {
      setInspectionBoxes((prev) =>
        prev.map((b, i) => (i === boxIndex ? { ...b, photoUrl: '' } : b))
      );
    } else {
      setDefectBoxes((prev) =>
        prev.map((b, i) => (i === boxIndex ? { ...b, photoUrl: '' } : b))
      );
    }
  };

  const handleUpdateBoxName = (
    type: 'inspection' | 'defect',
    boxIndex: number,
    name: string
  ) => {
    if (type === 'inspection') {
      setInspectionBoxes((prev) =>
        prev.map((b, i) => (i === boxIndex ? { ...b, name } : b))
      );
    } else {
      setDefectBoxes((prev) =>
        prev.map((b, i) => (i === boxIndex ? { ...b, name } : b))
      );
    }
  };

  const addMoreBoxes = (type: 'inspection' | 'defect') => {
    if (type === 'inspection') {
      setInspectionBoxes((prev) => {
        const start = prev.length;
        const newOnes: PhotoBoxItem[] = [];
        for (let i = 0; i < 4; i++) {
          newOnes.push({ id: start + i + 1, photoUrl: '', name: String(start + i + 1) });
        }
        return [...prev, ...newOnes];
      });
    } else {
      setDefectBoxes((prev) => {
        const start = prev.length;
        const newOnes: PhotoBoxItem[] = [];
        for (let i = 0; i < 4; i++) {
          const idx = start + i;
          newOnes.push({
            id: idx + 1,
            photoUrl: '',
            name: defects[idx]?.description || `Defect ${idx + 1}`,
          });
        }
        return [...prev, ...newOnes];
      });
    }
  };

  // ---------------------------------------------------------------------------
  // DOCUMENT PHOTO HANDLERS (for Packing List & Measure tabs)
  // ---------------------------------------------------------------------------
  const handleUploadDocumentPhoto = async (
    file: File,
    type: 'packing' | 'measure',
    index?: number
  ) => {
    try {
      setUploadingDoc(true);
      const resizedBase64 = await resizeImage(file, 1400);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: resizedBase64 }),
      });
      const data = await res.json();
      if (data.url) {
        if (type === 'packing') {
          setPackingListPhotos((prev) => {
            if (typeof index === 'number' && index >= 0 && index < prev.length) {
              const copy = [...prev];
              copy[index] = data.url;
              return copy;
            }
            return [...prev, data.url];
          });
        } else {
          setMeasurePhotos((prev) => {
            if (typeof index === 'number' && index >= 0 && index < prev.length) {
              const copy = [...prev];
              copy[index] = data.url;
              return copy;
            }
            return [...prev, data.url];
          });
        }
      } else {
        alert('Document photo upload failed: ' + (data.error || 'Server error'));
      }
    } catch (e: any) {
      alert('Error uploading document photo: ' + e?.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleRemoveDocumentPhoto = (type: 'packing' | 'measure', index: number) => {
    if (type === 'packing') {
      setPackingListPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      setMeasurePhotos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // ---------------------------------------------------------------------------
  // GENERATE REPORT / PREVIEW HANDLER
  // ---------------------------------------------------------------------------
  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const saveResult = await saveDraft();
      if (saveResult.error) {
        alert(`Draft save failed: ${saveResult.error}`);
        setGenerating(false);
        return;
      }

      const targetId = saveResult.inspection?.id || inspectionIdRef.current || inspectionId;
      if (!targetId) {
        alert('Could not determine inspection ID for report generation.');
        setGenerating(false);
        return;
      }

      const res = await fetch(`/api/inspections/${targetId}/generate-excel`, {
        method: 'POST',
      });

      if (!res.ok) {
        const errText = await res.text();
        alert(`Failed to generate report: ${errText}`);
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
      alert(`Error generating report file: ${err?.message || 'Server error'}`);
    } finally {
      setGenerating(false);
    }
  };

  const tabs = [
    { num: 1, label: '1. Audit' },
    { num: 2, label: '2. Packing list' },
    { num: 3, label: '3. Measure' },
    { num: 4, label: '4. Inspection photos' },
    { num: 5, label: '5. Defects photos' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Navbar & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/inspections')}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Return to Inspections List"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wide text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                  {inspectionNumber}
                </span>
                <span className="text-xs font-extrabold text-slate-400">
                  {poNumber ? `PO #${poNumber}` : 'New QA Inspection'}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold mt-0.5">
                {productDescription || 'Garment Quality Inspection'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto flex-wrap">
            {/* Live Save Status */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                  <span className="hidden sm:inline">Saving…</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">{lastSavedTime ? `Saved at ${lastSavedTime}` : 'Draft ready'}</span>
                </>
              )}
            </div>

            {canWrite && (
              <button
                type="button"
                onClick={() => setClearDialogOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                title="Clear all fields in this report"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => router.push('/inspections')}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleManualSave}
              disabled={saving}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl transition cursor-pointer"
            >
              Save
            </button>

            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={generating}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95 cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview & Finalize</span>
                </>
              )}
            </button>
          </div>
        </div>

        {validationError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* ── 5 TABS NAVIGATION (All clickable anytime) ────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((t) => {
              const isActive = activeTab === t.num;
              return (
                <button
                  key={t.num}
                  type="button"
                  onClick={() => setActiveTab(t.num)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t.num}
                  </span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TAB 1: AUDIT (FULL SHEET LAYOUT TOP TO BOTTOM) ───────────────────── */}
        {activeTab === 1 && (
          <div className="space-y-6">
            {/* 1. Header Information (17 fields) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <ClipboardList className="w-4 h-4 text-blue-500" />
                  <span>General Information & Header</span>
                </div>
                <span className="text-xs text-slate-400">Order & Factory Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Product Description</label>
                  <input
                    type="text"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Inspection Date</label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Inspection Team / Agency</label>
                  <input
                    type="text"
                    value={inspectionTeam}
                    onChange={(e) => setInspectionTeam(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Customer</label>
                  <input
                    type="text"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Account</label>
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Merchandiser</label>
                  <input
                    type="text"
                    value={merchandiser}
                    onChange={(e) => setMerchandiser(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Factory Name</label>
                  <input
                    type="text"
                    value={factoryName}
                    onChange={(e) => setFactoryName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Factory Location</label>
                  <input
                    type="text"
                    value={factoryLocation}
                    onChange={(e) => setFactoryLocation(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Country of Origin</label>
                  <input
                    type="text"
                    value={countryOfOrigin}
                    onChange={(e) => setCountryOfOrigin(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Item / Style No</label>
                  <input
                    type="text"
                    value={styleNumber}
                    onChange={(e) => setStyleNumber(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Purchase Order (PO) No</label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Order Quantity</label>
                  <input
                    type="number"
                    value={poQuantity}
                    onChange={(e) => setPoQuantity(Number(e.target.value) || 0)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Program / Season</label>
                  <input
                    type="text"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Colour Ways</label>
                  <input
                    type="text"
                    value={colorWays}
                    onChange={(e) => setColorWays(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Size Breakdown</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Shipment Date</label>
                  <input
                    type="date"
                    value={shipmentDate}
                    onChange={(e) => setShipmentDate(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Inspector Name</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* 2. Type Matrix & Shipping */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Truck className="w-4 h-4 text-indigo-500" />
                  <span>Type Matrix & Shipment Logistics</span>
                </div>
                <span className="text-xs text-slate-400">Inspection Types & Carton Count</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Type of Sample</label>
                  <select
                    value={sampleType}
                    onChange={(e) => setSampleType(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  >
                    <option>Fit / Size Set Sample</option>
                    <option>Pre-Production Sample</option>
                    <option>TOP Sample</option>
                    <option>Reference Sample</option>
                    <option>Bulk Production</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Type of Inspection</label>
                  <select
                    value={inspectionType}
                    onChange={(e) => setInspectionType(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  >
                    <option>1st Batch | Pre-Final</option>
                    <option>In-line</option>
                    <option>Final</option>
                    <option>Re-Inline | Re-Final</option>
                    <option>Pre-Shipment Inspection (FRI)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Type of Order</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  >
                    <option>Replenishment</option>
                    <option>New Order</option>
                    <option>Repeat Order</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Ship By</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="shipBy"
                        checked={shipBy === 'Sea'}
                        onChange={() => setShipBy('Sea')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Sea</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                      <input
                        type="radio"
                        name="shipBy"
                        checked={shipBy === 'Air'}
                        onChange={() => setShipBy('Air')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Air</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Total Cartons</label>
                  <input
                    type="number"
                    value={totalCartons}
                    onChange={(e) => setTotalCartons(Number(e.target.value) || 0)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Qty Shipped</label>
                  <input
                    type="number"
                    value={qtyShipped}
                    onChange={(e) => setQtyShipped(Number(e.target.value) || 0)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-500 dark:text-slate-400">Qty Available for Inspection</label>
                  <input
                    type="number"
                    value={qtyAvailable}
                    onChange={(e) => setQtyAvailable(Number(e.target.value) || 0)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>
            </div>

            {/* 3. AQL Parameters & Live Calculated Result */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <ShieldAlert className="w-4 h-4 text-emerald-500" />
                  <span>AQL Sampling Plan & Live Inspection Result</span>
                </div>
                {/* Live calculated badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Inspection Result:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      effectiveResult === 'FAILED'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800'
                        : effectiveResult === 'PENDING'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : effectiveResult === 'NEED IMPROVEMENT'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    {effectiveResult}
                  </span>
                  {overrideResult && (
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-900">
                      set manually
                    </span>
                  )}
                </div>
              </div>

              {/* Live Reason banner */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-600 dark:text-slate-400">Rule Evaluation:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {calculationReason || 'All counts within accepted thresholds'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-semibold">Override Result:</span>
                  <select
                    value={overrideResult}
                    onChange={(e) => setOverrideResult(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  >
                    <option value="">Auto (Calculated)</option>
                    <option value="PASSED">Passed</option>
                    <option value="FAILED">Failed</option>
                    <option value="PENDING">Pending</option>
                    <option value="NEED IMPROVEMENT">Need improvement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Inspection Level</label>
                  <select
                    value={inspectionLevel}
                    onChange={(e) => setInspectionLevel(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="I">Level I</option>
                    <option value="II">Level II</option>
                    <option value="III">Level III</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Inspected Qty</label>
                  <input
                    type="number"
                    value={inspectedQty}
                    onChange={(e) => setInspectedQty(Number(e.target.value) || 0)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Critical Accept</label>
                  <input
                    type="text"
                    value={criticalAccept}
                    onChange={(e) => setCriticalAccept(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Major Accept</label>
                  <input
                    type="text"
                    value={majorAccept}
                    onChange={(e) => setMajorAccept(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Minor Accept</label>
                  <input
                    type="text"
                    value={minorAccept}
                    onChange={(e) => setMinorAccept(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* 4. Defect Classification Table */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>Defect Classification & Log</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    One row per defect. Totals by level are the sum of pieces found per level.
                  </p>
                </div>

                {/* Defect Totals by Level */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 rounded-lg font-bold">
                    Critical: {criticalTotal}
                  </span>
                  <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 rounded-lg font-bold">
                    Major: {majorTotal}
                  </span>
                  <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded-lg font-bold">
                    Minor: {minorTotal}
                  </span>
                  <button
                    type="button"
                    onClick={addDefectRow}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Defect</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-2.5">Colour</th>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Defect Description</th>
                      <th className="p-2.5">Level</th>
                      <th className="p-2.5 w-16 text-center">Qty</th>
                      <th className="p-2.5">Comments (MPSS)</th>
                      <th className="p-2.5">Comments (Factory)</th>
                      <th className="p-2.5 w-10 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {defects.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-slate-400 italic">
                          No defects recorded. Click &quot;Add Defect&quot; to log a defect finding.
                        </td>
                      </tr>
                    ) : (
                      defects.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-2">
                            <input
                              type="text"
                              value={d.colour || ''}
                              onChange={(e) => updateDefectRow(d.id, { colour: e.target.value })}
                              placeholder="WHITE"
                              className="w-20 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={d.defectCode || ''}
                              onChange={(e) => updateDefectRow(d.id, { defectCode: e.target.value })}
                              placeholder="DEF-001"
                              className="w-24 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                            />
                          </td>
                          <td className="p-2 min-w-[220px]">
                            <input
                              type="text"
                              value={d.description}
                              onChange={(e) => updateDefectRow(d.id, { description: e.target.value })}
                              placeholder="Describe defect..."
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={d.severity}
                              onChange={(e) => updateDefectRow(d.id, { severity: e.target.value as any })}
                              className={`p-1.5 rounded-lg border text-xs font-bold ${
                                d.severity === 'Critical'
                                  ? 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950/80 dark:text-red-300'
                                  : d.severity === 'Major'
                                  ? 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                                  : 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                              }`}
                            >
                              <option value="Critical">Critical</option>
                              <option value="Major">Major</option>
                              <option value="Minor">Minor</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min={1}
                              value={d.quantity}
                              onChange={(e) => updateDefectRow(d.id, { quantity: Number(e.target.value) || 1 })}
                              className="w-16 p-1.5 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={d.commentsMpss || ''}
                              onChange={(e) => updateDefectRow(d.id, { commentsMpss: e.target.value })}
                              placeholder="MPSS remark"
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={d.commentsFactory || ''}
                              onChange={(e) => updateDefectRow(d.id, { commentsFactory: e.target.value })}
                              placeholder="Factory response"
                              className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeDefectRow(d.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Items to Check (22 Template Checkpoints) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>Items to Check (Master 22 Checkpoints)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Radio grid matching template checkpoints. Mark YES, NO, or N/A.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-bold text-emerald-600">
                    {itemsToCheck.filter((i) => i.status === 'YES').length} YES
                  </span>
                  <span>·</span>
                  <span className="font-bold text-red-600">
                    {itemsToCheck.filter((i) => i.status === 'NO').length} NO
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {itemsToCheck.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5 max-w-md">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {item.id}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.question}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Yes / No / N/A Radio Buttons */}
                      <div className="flex items-center gap-2">
                        {(['YES', 'NO', 'N/A'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateChecklistItem(item.id, opt)}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                              item.status === opt
                                ? opt === 'YES'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : opt === 'NO'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'bg-slate-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {/* Comment Input */}
                      <input
                        type="text"
                        value={item.comment || ''}
                        onChange={(e) => updateChecklistItem(item.id, item.status, e.target.value)}
                        placeholder="Checkpoint comments..."
                        className="w-full sm:w-64 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Production Status */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Percent className="w-4 h-4 text-amber-500" />
                  <span>Production Status</span>
                </div>
                <span className="text-xs text-slate-400">Process completion & cartons</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">% Cutting</label>
                  <input
                    type="text"
                    value={cuttingPercent}
                    onChange={(e) => setCuttingPercent(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">% Sewing</label>
                  <input
                    type="text"
                    value={sewingPercent}
                    onChange={(e) => setSewingPercent(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">% Trimming & Fin.</label>
                  <input
                    type="text"
                    value={trimmingPercent}
                    onChange={(e) => setTrimmingPercent(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">% Goods Packed</label>
                  <input
                    type="text"
                    value={packedPercent}
                    onChange={(e) => setPackedPercent(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Total Carton Qty</label>
                  <input
                    type="text"
                    value={totalCartonQty}
                    onChange={(e) => setTotalCartonQty(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Cartons Packed</label>
                  <input
                    type="text"
                    value={cartonsPacked}
                    onChange={(e) => setCartonsPacked(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-center"
                  />
                </div>
              </div>
            </div>

            {/* 7. Measurement Summary */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  <Sliders className="w-4 h-4 text-purple-500" />
                  <span>Measurement Summary (Audit Sheet)</span>
                </div>
                <span className="text-xs text-slate-400">POM points & deviation criteria</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Result</label>
                  <select
                    value={measurementResult}
                    onChange={(e) => setMeasurementResult(e.target.value as any)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold"
                  >
                    <option value="PASS">PASS</option>
                    <option value="FAIL">FAIL</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Sample Size</label>
                  <input
                    type="text"
                    value={measurementSampleSize}
                    onChange={(e) => setMeasurementSampleSize(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Max Allowed Pts</label>
                  <input
                    type="text"
                    value={maxAllowedPoints}
                    onChange={(e) => setMaxAllowedPoints(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Total POM Points</label>
                  <input
                    type="text"
                    value={totalPomPoints}
                    onChange={(e) => setTotalPomPoints(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Defective Points</label>
                  <input
                    type="text"
                    value={defectivePointsFound}
                    onChange={(e) => setDefectivePointsFound(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-center text-red-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-500 dark:text-slate-400">Criteria</label>
                  <input
                    type="text"
                    value={sampleSizeCriteria}
                    onChange={(e) => setSampleSizeCriteria(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-xs text-slate-500 dark:text-slate-400">Measurement Comment</label>
                <input
                  type="text"
                  value={measurementComment}
                  onChange={(e) => setMeasurementComment(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>
            </div>

            {/* 8. Comments, Others & Selected Cartons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <label className="font-bold text-xs text-slate-500 dark:text-slate-400">Overall Comments</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs resize-y"
                  placeholder="Audit summary notes, observations, recommendations..."
                />
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <label className="font-bold text-xs text-slate-500 dark:text-slate-400">Others Notes</label>
                  <input
                    type="text"
                    value={othersComment}
                    onChange={(e) => setOthersComment(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-xs text-slate-500 dark:text-slate-400">Selected Carton Numbers</label>
                  <input
                    type="text"
                    value={selectedCartons}
                    onChange={(e) => setSelectedCartons(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 9. Signatures (3 Signature Pads: MPSS QC, Approved By, Supplier Rep) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-blue-500" />
                  <span>Audit Signatures & Approvals</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Touch or mouse signature pad for each signatory. Captured signatures are saved as transparent PNGs into Excel.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. MPSS QC */}
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="text-xs font-bold text-slate-400">MPSS QC Auditor Name</label>
                    <input
                      type="text"
                      value={mpssQcName}
                      onChange={(e) => setMpssQcName(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                  <SignaturePad
                    label="MPSS QC Signature"
                    value={mpssQcSignature}
                    onChange={setMpssQcSignature}
                  />
                </div>

                {/* 2. Approved By */}
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="text-xs font-bold text-slate-400">Approved By Name</label>
                    <input
                      type="text"
                      value={approvedByName}
                      onChange={(e) => setApprovedByName(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                  <SignaturePad
                    label="Approved By Signature"
                    value={approvedBySignature}
                    onChange={setApprovedBySignature}
                  />
                </div>

                {/* 3. Supplier Representative */}
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="text-xs font-bold text-slate-400">Supplier / Factory Representative</label>
                    <input
                      type="text"
                      value={supplierRepName}
                      onChange={(e) => setSupplierRepName(e.target.value)}
                      className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                  <SignaturePad
                    label="Supplier Rep Signature"
                    value={supplierRepSignature}
                    onChange={setSupplierRepSignature}
                  />
                </div>
              </div>
            </div>

            {/* 10. Important Notes (Read-only Template Notice) */}
            <div className="p-4 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
              <span className="font-black text-[11px] text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                IMPORTANT NOTES FROM MASTER TEMPLATE:
              </span>
              <p>
                1. This inspection report reflects findings at the time and place of inspection.
              </p>
              <p>
                2. Inspection was performed in accordance with ANSI / ASQ Z1.4-2003 Single Sampling Normal Inspection plans.
              </p>
              <p>
                3. This report does not relieve supplier or manufacturer from their contractual responsibilities or guarantee acceptance by buyer.
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 2: PACKING LIST ───────────────────────────────────────────── */}
        {activeTab === 2 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Box className="w-5 h-5 text-blue-600" />
                  <span>Packing List Verification</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify shipping breakdown, carton allocations, and packing list documentation.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Report #</span>
                <span className="text-xs font-black font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/60 shadow-xs">
                  {inspectionNumber}
                </span>
              </div>
            </div>

            {/* Section 1: Packing List Header Fields */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <span>Packing List Header Fields</span>
                  <span className="text-[10px] lowercase font-normal text-slate-400">(prefilled from Audit, editable)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Date</label>
                  <input
                    type="date"
                    value={packingListDate}
                    onChange={(e) => setPackingListDate(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Style # */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Style #</label>
                  <input
                    type="text"
                    value={packingListStyle}
                    onChange={(e) => setPackingListStyle(e.target.value)}
                    placeholder="e.g. YCAT0110"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Order Qty */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Order Qty</label>
                  <input
                    type="text"
                    value={packingListOrderQty}
                    onChange={(e) => setPackingListOrderQty(e.target.value)}
                    placeholder="e.g. 2600"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Factory */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Factory</label>
                  <input
                    type="text"
                    value={packingListFactory}
                    onChange={(e) => setPackingListFactory(e.target.value)}
                    placeholder="e.g. JRP EXPORTS"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* PO # */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">PO #</label>
                  <input
                    type="text"
                    value={packingListPo}
                    onChange={(e) => setPackingListPo(e.target.value)}
                    placeholder="e.g. 4500159665"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Cut Qty */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Cut Qty</label>
                  <input
                    type="text"
                    value={packingListCutQty}
                    onChange={(e) => setPackingListCutQty(e.target.value)}
                    placeholder="e.g. 2600"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Location</label>
                  <input
                    type="text"
                    value={packingListLocation}
                    onChange={(e) => setPackingListLocation(e.target.value)}
                    placeholder="e.g. SEYENTHAMPALAYAM"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Colours */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Colours</label>
                  <input
                    type="text"
                    value={packingListColours}
                    onChange={(e) => setPackingListColours(e.target.value)}
                    placeholder="e.g. WHITE"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Ship Qty */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Ship Qty</label>
                  <input
                    type="text"
                    value={packingListShipQty}
                    onChange={(e) => setPackingListShipQty(e.target.value)}
                    placeholder="e.g. 2592"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Multi-Photo Uploader for Packing List Documents */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-500" />
                    <span>Packing List Document Photos</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload or capture photos of physical packing sheets, carton breakdown lists, or shipping documents (auto-resized to 1400px).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Camera Button */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      hidden
                      disabled={uploadingDoc}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadDocumentPhoto(f, 'packing');
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {/* Upload Button */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition border border-slate-200 dark:border-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      disabled={uploadingDoc}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        for (const f of files) {
                          await handleUploadDocumentPhoto(f, 'packing');
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              {uploadingDoc && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-600 dark:text-blue-400 font-bold">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing and uploading document photo (resizing to 1400px)…</span>
                </div>
              )}

              {/* Grid of uploaded packing list photos */}
              {packingListPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No packing documents added yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Use the buttons above to photograph or attach packing sheets.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {packingListPhotos.map((photoUrl, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <div className="aspect-4/3 w-full bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden relative group">
                        <img
                          src={photoUrl}
                          alt={`Packing document ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {/* Replace Camera */}
                          <label className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg cursor-pointer backdrop-blur-xs transition" title="Take replacement photo with Camera">
                            <Camera className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadDocumentPhoto(f, 'packing', idx);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          {/* Replace File */}
                          <label className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg cursor-pointer backdrop-blur-xs transition" title="Replace with file">
                            <RefreshCw className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadDocumentPhoto(f, 'packing', idx);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveDocumentPhoto('packing', idx)}
                            className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition"
                            title="Remove document photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-center text-xs font-bold text-slate-600 dark:text-slate-300 truncate">
                        Packing Doc #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: MEASURE ─────────────────────────────────────────────────── */}
        {activeTab === 3 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  <span>Garment Measurement & Specs</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Factory spec verification, measurement audit records, and approved size charts.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Report #</span>
                <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs">
                  {inspectionNumber}
                </span>
              </div>
            </div>

            {/* Section 1: Measure Header Fields */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <span>Measurement Spec Header</span>
                  <span className="text-[10px] lowercase font-normal text-slate-400">(prefilled from Audit, editable)</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Factory */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Factory</label>
                  <input
                    type="text"
                    value={measureFactory}
                    onChange={(e) => setMeasureFactory(e.target.value)}
                    placeholder="e.g. JRP EXPORTS"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* VPN (Style) */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">VPN (Style)</label>
                  <input
                    type="text"
                    value={measureVpnStyle}
                    onChange={(e) => setMeasureVpnStyle(e.target.value)}
                    placeholder="e.g. YCAT0110"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Purchase Order */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Purchase Order</label>
                  <input
                    type="text"
                    value={measurePo}
                    onChange={(e) => setMeasurePo(e.target.value)}
                    placeholder="e.g. 4500159665"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Style Description */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Style Description</label>
                  <input
                    type="text"
                    value={measureStyleDesc}
                    onChange={(e) => setMeasureStyleDesc(e.target.value)}
                    placeholder="e.g. Men Crew Neck 100% Cotton Polo T-Shirt"
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Audit Date */}
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Audit Date</label>
                  <input
                    type="date"
                    value={measureAuditDate}
                    onChange={(e) => setMeasureAuditDate(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Multi-Photo Uploader for Measurement Chart Documents */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-indigo-500" />
                    <span>Measurement Chart Photos</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload or capture physical measurement charts, graded size specs, or tolerance audit sheets (auto-resized to 1400px).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Camera Button */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      hidden
                      disabled={uploadingDoc}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadDocumentPhoto(f, 'measure');
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {/* Upload Button */}
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition border border-slate-200 dark:border-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      disabled={uploadingDoc}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        for (const f of files) {
                          await handleUploadDocumentPhoto(f, 'measure');
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              {uploadingDoc && (
                <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 rounded-xl text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing and uploading measurement chart photo (resizing to 1400px)…</span>
                </div>
              )}

              {/* Grid of uploaded measurement chart photos */}
              {measurePhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No measurement charts added yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Use the buttons above to photograph or attach measurement chart sheets.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {measurePhotos.map((photoUrl, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <div className="aspect-4/3 w-full bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden relative group">
                        <img
                          src={photoUrl}
                          alt={`Measurement chart ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {/* Replace Camera */}
                          <label className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg cursor-pointer backdrop-blur-xs transition" title="Take replacement photo with Camera">
                            <Camera className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadDocumentPhoto(f, 'measure', idx);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          {/* Replace File */}
                          <label className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg cursor-pointer backdrop-blur-xs transition" title="Replace with file">
                            <RefreshCw className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadDocumentPhoto(f, 'measure', idx);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveDocumentPhoto('measure', idx)}
                            className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition"
                            title="Remove chart photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-center text-xs font-bold text-slate-600 dark:text-slate-300 truncate">
                        Measure Chart #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: INSPECTION PHOTOS TAB ───────────────────────────────────── */}
        {activeTab === 4 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-extrabold">Inspection Photos</h2>
                <p className="text-xs text-slate-500">
                  4 photos per row (2 on mobile). Click &quot;Take photo&quot; to open camera or upload an image.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  Filled: {inspectionBoxes.filter((b) => b.photoUrl).length} / {inspectionBoxes.length}
                </span>
                <button
                  type="button"
                  onClick={() => addMoreBoxes('inspection')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add 4 more boxes</span>
                </button>
              </div>
            </div>

            {/* Photo Grid: 4 per row desktop, 2 per row mobile */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {inspectionBoxes.map((box, idx) => (
                <div
                  key={box.id}
                  className="flex flex-col bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  {/* Photo Area */}
                  <div className="aspect-4/3 w-full bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden relative flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 group">
                    {box.photoUrl ? (
                      <>
                        <img
                          src={box.photoUrl}
                          alt={box.name || `Box ${box.id}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg cursor-pointer backdrop-blur-xs transition" title="Replace photo">
                            <RefreshCw className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadPhoto(f, 'inspection', idx);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto('inspection', idx)}
                            className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition"
                            title="Remove photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">Box #{box.id}</span>
                        <div className="flex items-center gap-1.5 pt-1">
                          {/* Take Photo Button (Camera Capture) */}
                          <label
                            className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition shadow-xs"
                            title="Open Camera"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Camera</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadPhoto(f, 'inspection', idx);
                                e.target.value = '';
                              }}
                            />
                          </label>

                          {/* Upload Photo Button */}
                          <label
                            className="flex items-center gap-1 px-2 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg cursor-pointer transition"
                            title="Upload File"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadPhoto(f, 'inspection', idx);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Name field sitting under each box */}
                  <div className="mt-2.5">
                    <input
                      type="text"
                      value={box.name}
                      placeholder={`Box ${box.id}`}
                      onChange={(e) => handleUpdateBoxName('inspection', idx, e.target.value)}
                      className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 text-center"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => addMoreBoxes('inspection')}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add 4 more boxes</span>
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 5: DEFECTS PHOTOS TAB ──────────────────────────────────────── */}
        {activeTab === 5 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-extrabold">Defects Photos</h2>
                <p className="text-xs text-slate-500">
                  4 photos per row. The name field suggests the corresponding defect from the Audit tab and auto-fills on photo addition.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  Filled: {defectBoxes.filter((b) => b.photoUrl).length} / {defectBoxes.length}
                </span>
                <button
                  type="button"
                  onClick={() => addMoreBoxes('defect')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add 4 more boxes</span>
                </button>
              </div>
            </div>

            {/* Defect Photo Grid: starts with 8 boxes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {defectBoxes.map((box, idx) => (
                <div
                  key={box.id}
                  className="flex flex-col bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  {/* Photo Area */}
                  <div className="aspect-4/3 w-full bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden relative flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 group">
                    {box.photoUrl ? (
                      <>
                        <img
                          src={box.photoUrl}
                          alt={box.name || `Defect ${box.id}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-lg cursor-pointer backdrop-blur-xs transition" title="Replace defect photo">
                            <RefreshCw className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadPhoto(f, 'defect', idx);
                                e.target.value = '';
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto('defect', idx)}
                            className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition"
                            title="Remove photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-red-500">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-400">Defect #{box.id}</span>
                        <div className="flex items-center gap-1.5 pt-1">
                          {/* Take Photo (Camera) */}
                          <label
                            className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition shadow-xs"
                            title="Open Camera"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Camera</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadPhoto(f, 'defect', idx);
                                e.target.value = '';
                              }}
                            />
                          </label>

                          {/* Upload File */}
                          <label
                            className="flex items-center gap-1 px-2 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg cursor-pointer transition"
                            title="Upload File"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadPhoto(f, 'defect', idx);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Defect Description Field (suggests Nth Audit defect as placeholder) */}
                  <div className="mt-2.5">
                    <input
                      type="text"
                      value={box.name}
                      placeholder={defects[idx]?.description || `Defect ${box.id}`}
                      onChange={(e) => handleUpdateBoxName('defect', idx, e.target.value)}
                      className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-red-500 text-center"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => addMoreBoxes('defect')}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add 4 more boxes</span>
              </button>
            </div>
          </div>
        )}

        {/* ── BOTTOM PREVIOUS / NEXT BAR ─────────────────────────────────────── */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-wrap gap-3">
          <button
            type="button"
            disabled={activeTab === 1}
            onClick={() => setActiveTab((p) => Math.max(1, p - 1))}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 1
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-bold text-slate-400">
            Tab {activeTab} of 5
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {canWrite && (
              <button
                type="button"
                onClick={() => setClearDialogOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                title="Clear all fields in this report"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear all</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => router.push('/inspections')}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleManualSave}
              disabled={saving}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Save
            </button>

            {activeTab < 5 ? (
              <button
                type="button"
                onClick={() => setActiveTab((p) => Math.min(5, p + 1))}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={generating}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Preview & Finalize</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── CONFIRMATION DIALOG: CLEAR ALL ─────────────────────────────────── */}
        <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Clear all?
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Would you like to clear everything written in this report?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex flex-row items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setClearDialogOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl"
              >
                No
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleClearAll}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
              >
                Yes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default QAStepperWizard;
