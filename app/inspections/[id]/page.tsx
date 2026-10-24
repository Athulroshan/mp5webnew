import React from 'react';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { QAStepperWizard } from '@/components/inspections/qa-stepper-wizard';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Edit QA Inspection | MPSS Digitization System',
};

export default async function EditInspectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: {
      measurements: true,
      defects: true,
      photos: true,
    },
  });

  if (!inspection) {
    notFound();
  }

  // Parse measurements actualValues JSON
  const formattedMeasurements = inspection.measurements.map((m: any) => ({
    ...m,
    actualValues: m.actualValues ? JSON.parse(m.actualValues) : [],
  }));

  const initialData = {
    ...inspection,
    measurements: formattedMeasurements,
  };

  return <QAStepperWizard initialData={initialData} />;
}
