import React from 'react';
import { QAStepperWizard } from '@/components/inspections/qa-stepper-wizard';

export const metadata = {
  title: 'New QA Inspection | MPSS Digitization System',
  description: 'Mobile-first garment quality inspection web interface linked directly to Master Excel templates.',
};

export default function NewInspectionPage() {
  return <QAStepperWizard />;
}
