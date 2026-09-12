'use client';

import React from 'react';
import { CheckCircle2, XCircle, MinusCircle, AlertCircle } from 'lucide-react';

export interface ChecklistItem {
  id: number;
  question: string;
  status: 'YES' | 'NO' | 'N/A';
  comment: string;
}

export const default22Questions: string[] = [
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
  'Lab Test Report'
];

interface ChecklistSectionProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export function ChecklistSection({ items, onChange }: ChecklistSectionProps) {
  // Initialize default 22 items if empty
  const activeItems: ChecklistItem[] = items && items.length === 22
    ? items
    : default22Questions.map((q, idx) => ({
        id: idx + 1,
        question: q,
        status: 'YES',
        comment: 'Conforms to approved standard sample',
      }));

  const updateStatus = (index: number, status: 'YES' | 'NO' | 'N/A') => {
    const updated = [...activeItems];
    updated[index] = {
      ...updated[index],
      status,
      // If NO, prompt for issue description if default text remains
      comment: status === 'NO' && updated[index].comment === 'Conforms to approved standard sample'
        ? 'Non-conformance detected: needs correction'
        : updated[index].comment,
    };
    onChange(updated);
  };

  const updateComment = (index: number, comment: string) => {
    const updated = [...activeItems];
    updated[index] = { ...updated[index], comment };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Items to Check (Quality Inspection Checklist)
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Answer all 22 standard inspection questions. Values map directly to the Audit worksheet.
        </p>
      </div>

      <div className="space-y-3">
        {activeItems.map((item, idx) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border transition ${
              item.status === 'NO'
                ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                : item.status === 'N/A'
                ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Question Label */}
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.id}
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 pt-0.5">
                  {item.question}
                </p>
              </div>

              {/* Response Toggle Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => updateStatus(idx, 'YES')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                    item.status === 'YES'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  YES
                </button>

                <button
                  type="button"
                  onClick={() => updateStatus(idx, 'NO')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                    item.status === 'NO'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  NO
                </button>

                <button
                  type="button"
                  onClick={() => updateStatus(idx, 'N/A')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                    item.status === 'N/A'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <MinusCircle className="w-3.5 h-3.5" />
                  N/A
                </button>
              </div>
            </div>

            {/* Conditional Issue / Observation Input */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <input
                type="text"
                value={item.comment}
                onChange={(e) => updateComment(idx, e.target.value)}
                placeholder={item.status === 'NO' ? 'Describe the non-conformance issue...' : 'Observation notes...'}
                className={`w-full text-xs px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  item.status === 'NO'
                    ? 'bg-white dark:bg-slate-900 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 font-medium'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
