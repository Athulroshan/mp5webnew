'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Camera, ShieldAlert } from 'lucide-react';
import { PhotoUploader } from './photo-uploader';

export interface DefectItem {
  defectCode: string;
  description: string;
  location: string;
  severity: string; // Critical | Major | Minor
  quantity: number;
  photoUrl?: string;
}

interface DefectManagerProps {
  defects: DefectItem[];
  onChange: (defects: DefectItem[]) => void;
  onPhotoAdd?: (photoUrl: string, defectCode: string) => void;
}

export function DefectManager({ defects, onChange, onPhotoAdd }: DefectManagerProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Front Body');
  const [severity, setSeverity] = useState('Major');
  const [quantity, setQuantity] = useState(1);
  const [defectPhotoUrl, setDefectPhotoUrl] = useState('');

  useEffect(() => {
    fetch('/api/defect-codes')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error('Failed to load defect codes:', err));
  }, []);

  const handleDefectSelect = (codeStr: string) => {
    setSelectedCode(codeStr);
    for (const cat of categories) {
      const match = cat.defects.find((d: any) => d.code === codeStr);
      if (match) {
        setDescription(match.description);
        setSeverity(match.severity || 'Major');
        setLocation(match.location || 'Front Body');
        break;
      }
    }
  };

  const addDefect = () => {
    if (!selectedCode) return;

    const newDefect: DefectItem = {
      defectCode: selectedCode,
      description,
      location,
      severity,
      quantity: Number(quantity) || 1,
      photoUrl: defectPhotoUrl,
    };

    onChange([...defects, newDefect]);

    if (defectPhotoUrl && onPhotoAdd) {
      onPhotoAdd(defectPhotoUrl, selectedCode);
    }

    // Reset draft fields
    setSelectedCode('');
    setDescription('');
    setQuantity(1);
    setDefectPhotoUrl('');
  };

  const removeDefect = (index: number) => {
    onChange(defects.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Garment Defects Log</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">Select defect code, quantity, severity, and optional photo.</p>
      </div>

      {/* Add Defect Form Card */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Defect Code Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Defect Code</label>
            <select
              value={selectedCode}
              onChange={(e) => handleDefectSelect(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Select Defect Code --</option>
              {categories.map((cat) => (
                <optgroup key={cat.category} label={cat.category}>
                  {cat.defects.map((d: any) => (
                    <option key={d.code} value={d.code}>
                      [{d.code}] {d.description}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description</label>
            <input
              type="text"
              placeholder="Defect details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Front Body">Front Body</option>
              <option value="Back Body">Back Body</option>
              <option value="Side Seam">Side Seam</option>
              <option value="Collar / Neck">Collar / Neck</option>
              <option value="Sleeve Left">Sleeve Left</option>
              <option value="Sleeve Right">Sleeve Right</option>
              <option value="Bottom Hem">Bottom Hem</option>
              <option value="Inner Label">Inner Label</option>
              <option value="Outer Packaging">Outer Packaging</option>
            </select>
          </div>

          {/* Severity & Quantity */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="Major">Major</option>
                <option value="Minor">Minor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Defect Photo Attachment */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
          <PhotoUploader
            photos={defectPhotoUrl ? [{ photoUrl: defectPhotoUrl, description: `Defect ${selectedCode}` }] : []}
            onChange={(pts) => setDefectPhotoUrl(pts.length > 0 ? pts[0].photoUrl : '')}
            type="defect"
            single={true}
            title="Attach Defect Photo (Optional)"
            subtitle="Take a photo of the defect for the report photo page"
          />
        </div>

        <button
          type="button"
          onClick={addDefect}
          disabled={!selectedCode}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          ADD DEFECT TO REPORT
        </button>
      </div>

      {/* Added Defects List */}
      {defects.length > 0 && (
        <div className="space-y-2">
          {defects.map((def, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {def.photoUrl ? (
                  <img src={def.photoUrl} alt="Defect" className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{def.defectCode}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        def.severity === 'Critical'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                          : def.severity === 'Major'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-400'
                      }`}
                    >
                      {def.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{def.description}</p>
                  <p className="text-[11px] text-slate-400">
                    Location: {def.location} | Qty: {def.quantity}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeDefect(idx)}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
