'use client';

import React from 'react';
import { Plus, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface MeasurementRow {
  measurementPoint: string;
  specRequired: string;
  tolerance: string;
  actualValues: string[]; // ["52.0", "52.5", "51.8"]
  result: string; // PASS | FAIL
}

interface MeasurementChartProps {
  measurements: MeasurementRow[];
  onChange: (measurements: MeasurementRow[]) => void;
}

export function MeasurementChart({ measurements, onChange }: MeasurementChartProps) {
  // Evaluates PASS/FAIL automatically if spec and actuals are numeric
  const calculateResult = (specStr: string, tolStr: string, actuals: string[]): string => {
    const specNum = parseFloat(specStr);
    const tolNum = parseFloat(tolStr.replace(/[^0-9.]/g, '')) || 1.0;

    if (isNaN(specNum) || actuals.length === 0) return 'PASS';

    for (const act of actuals) {
      if (!act || act.trim() === '') continue;
      const actNum = parseFloat(act);
      if (!isNaN(actNum)) {
        if (Math.abs(actNum - specNum) > tolNum) {
          return 'FAIL';
        }
      }
    }
    return 'PASS';
  };

  const updateRow = (index: number, field: keyof MeasurementRow, value: any) => {
    const updated = [...measurements];
    updated[index] = { ...updated[index], [field]: value };

    // Auto update result if actualValues, spec, or tolerance change
    if (field === 'actualValues' || field === 'specRequired' || field === 'tolerance') {
      updated[index].result = calculateResult(
        updated[index].specRequired,
        updated[index].tolerance,
        updated[index].actualValues
      );
    }
    onChange(updated);
  };

  const updateActualValue = (rowIndex: number, sampleIndex: number, val: string) => {
    const updated = [...measurements];
    const actuals = [...(updated[rowIndex].actualValues || ['', '', '', '', ''])];
    actuals[sampleIndex] = val;
    updated[rowIndex].actualValues = actuals;
    updated[rowIndex].result = calculateResult(
      updated[rowIndex].specRequired,
      updated[rowIndex].tolerance,
      actuals
    );
    onChange(updated);
  };

  const addRow = () => {
    const newRow: MeasurementRow = {
      measurementPoint: 'New Spec Point',
      specRequired: '50 cm',
      tolerance: '±1.0 cm',
      actualValues: ['', '', '', '', ''],
      result: 'PASS',
    };
    onChange([...measurements, newRow]);
  };

  const removeRow = (index: number) => {
    onChange(measurements.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Garment Measurement Specifications</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Enter actual sample measurements. Results auto-evaluate tolerances.</p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Point
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm bg-white dark:bg-slate-900">
        <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-2.5">Point Name</th>
              <th className="p-2.5 w-24">Required Spec</th>
              <th className="p-2.5 w-24">Tolerance</th>
              <th className="p-2.5 text-center" colSpan={5}>Actual Samples (1 - 5)</th>
              <th className="p-2.5 text-center w-20">Result</th>
              <th className="p-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {measurements.map((m, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                {/* Measurement Point */}
                <td className="p-2">
                  <input
                    type="text"
                    value={m.measurementPoint}
                    onChange={(e) => updateRow(idx, 'measurementPoint', e.target.value)}
                    className="w-full px-2 py-1 bg-transparent font-medium border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 rounded text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </td>

                {/* Spec Required */}
                <td className="p-2">
                  <input
                    type="text"
                    value={m.specRequired}
                    onChange={(e) => updateRow(idx, 'specRequired', e.target.value)}
                    className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 rounded text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </td>

                {/* Tolerance */}
                <td className="p-2">
                  <input
                    type="text"
                    value={m.tolerance}
                    onChange={(e) => updateRow(idx, 'tolerance', e.target.value)}
                    className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 rounded text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </td>

                {/* Samples 1 to 5 */}
                {[0, 1, 2, 3, 4].map((sIdx) => (
                  <td key={sIdx} className="p-1 text-center">
                    <input
                      type="text"
                      placeholder={`S${sIdx + 1}`}
                      value={(m.actualValues && m.actualValues[sIdx]) || ''}
                      onChange={(e) => updateActualValue(idx, sIdx, e.target.value)}
                      className="w-12 text-center px-1 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded text-slate-800 dark:text-slate-200 focus:outline-none text-xs"
                    />
                  </td>
                ))}

                {/* Result Badge */}
                <td className="p-2 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.result === 'FAIL'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    }`}
                  >
                    {m.result === 'FAIL' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    {m.result || 'PASS'}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
