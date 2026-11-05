import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  // Auth check — must be admin
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20', 10));

  try {
    const where = q
      ? {
          isActive: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { sku: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : { isActive: true };

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
      },
      orderBy: { name: 'asc' },
      take: limit,
    });

    return NextResponse.json({ products });
  } catch (error) {
    // Fallback to Supabase REST
    const sb = createAdminClient();
    if (sb) {
      try {
        let query = sb.from('products').select('id, name, sku, stock').eq('isActive', true);
        if (q) {
          query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
        }
        const { data } = await query.order('name', { ascending: true }).limit(limit);
        return NextResponse.json({ products: data || [] });
      } catch {}
    }

    console.error('Product search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
