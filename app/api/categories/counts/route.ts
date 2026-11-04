import { NextResponse } from 'next/server';
import { getCachedCategoryCounts } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getCachedCategoryCounts();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching category counts:', error);
    return NextResponse.json({
      total: 11,
      counts: {
        'laptop-computer': 5,
        monitor: 3,
        gaming: 0,
        'computer-accessories': 0,
        'cctv-security': 3,
        networking: 0,
        'power-electronics': 0,
      },
    });
  }
}
