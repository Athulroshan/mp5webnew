import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let existingNumbers: string[] = [];

    try {
      const records = await prisma.inspection.findMany({
        select: { inspectionNumber: true },
      });
      existingNumbers = records.map((r: { inspectionNumber: string }) => r.inspectionNumber);
    } catch (dbErr: any) {
      console.warn('[NEXT-NUMBER] Prisma fetch error, trying Supabase REST fallback:', dbErr?.message);
      // Fallback via HTTPS Supabase REST API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
      if (supabaseUrl && anonKey) {
        const res = await fetch(`${supabaseUrl}/rest/v1/Inspection?select=inspectionNumber`, {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
        });
        if (res.ok) {
          const rows = await res.json();
          existingNumbers = rows.map((r: any) => r.inspectionNumber);
        }
      }
    }

    let maxNum = 0;
    for (const numStr of existingNumbers) {
      const match = numStr?.match(/^FI_MPSS_(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }

    // Default to existing count if no numeric suffix matched
    if (maxNum === 0 && existingNumbers.length > 0) {
      maxNum = existingNumbers.length;
    }

    const nextNum = maxNum + 1;
    const candidate = `FI_MPSS_${nextNum.toString().padStart(4, '0')}`;

    return NextResponse.json({
      success: true,
      nextNumber: candidate,
      count: existingNumbers.length,
    });
  } catch (error: any) {
    console.error('[NEXT-NUMBER ERROR]', error);
    return NextResponse.json({
      success: true,
      nextNumber: 'FI_MPSS_0001',
    });
  }
}
