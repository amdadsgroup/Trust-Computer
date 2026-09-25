import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/lib/customer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    id: customer.id,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    avatarUrl: customer.avatarUrl,
  });
}
