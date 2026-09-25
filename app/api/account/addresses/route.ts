import { NextResponse } from 'next/server';
import { getCurrentCustomer, getCustomerAddresses } from '@/lib/customer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const addresses = await getCustomerAddresses(customer.id);
  return NextResponse.json(addresses);
}
