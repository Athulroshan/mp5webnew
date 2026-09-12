import { NextResponse } from 'next/server';

export async function GET() {
  const defectCategories = [
    {
      category: 'Workmanship',
      defects: [
        { code: 'DEF-001', description: 'Broken Stitch / Open Seam', severity: 'Major', location: 'Side Seam' },
        { code: 'DEF-002', description: 'Skipped Stitching', severity: 'Major', location: 'Hem / Collar' },
        { code: 'DEF-003', description: 'Uneven Hemline / Asymmetry', severity: 'Major', location: 'Bottom Hem' },
        { code: 'DEF-004', description: 'Puckering at Seams', severity: 'Minor', location: 'Armhole / Neck' },
      ],
    },
    {
      category: 'Fabric & Quality',
      defects: [
        { code: 'DEF-005', description: 'Fabric Hole / Cut / Tear', severity: 'Critical', location: 'Front Body' },
        { code: 'DEF-006', description: 'Color Shade Variance / Stain', severity: 'Major', location: 'Back Body' },
        { code: 'DEF-007', description: 'Fabric Slub / Snagging', severity: 'Minor', location: 'Sleeve' },
      ],
    },
    {
      category: 'Finishing & Pressing',
      defects: [
        { code: 'DEF-008', description: 'Uncut Threads / Loose Thread Ends', severity: 'Minor', location: 'Inside Seam' },
        { code: 'DEF-009', description: 'Iron Mark / Pressing Shine', severity: 'Minor', location: 'Chest' },
        { code: 'DEF-010', description: 'Dirty Mark / Oil Spot', severity: 'Major', location: 'Front Body' },
      ],
    },
    {
      category: 'Trims & Packaging',
      defects: [
        { code: 'DEF-011', description: 'Missing Main Label / Care Tag', severity: 'Critical', location: 'Inner Neck' },
        { code: 'DEF-012', description: 'Wrong Size Label Attached', severity: 'Critical', location: 'Inner Neck' },
        { code: 'DEF-013', description: 'Damaged Polybag / Wrong Barcode', severity: 'Major', location: 'Outer Polybag' },
      ],
    },
  ];

  return NextResponse.json({ categories: defectCategories });
}
