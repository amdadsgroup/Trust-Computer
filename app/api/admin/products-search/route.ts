import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

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
    console.error('Product search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
