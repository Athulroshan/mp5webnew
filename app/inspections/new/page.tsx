import React, { Suspense } from 'react';
import { QAStepperWizard } from '@/components/inspections/qa-stepper-wizard';

export const metadata = {
  title: 'New QA Inspection | MPSS Digitization System',
  description: 'Mobile-first garment quality inspection web interface linked directly to Master Excel templates.',
};

export default function NewInspectionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <QAStepperWizard />
    </Suspense>
  );
}
