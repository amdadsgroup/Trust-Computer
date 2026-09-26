import React from 'react';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import EditCouponForm from './EditCouponForm';

export const dynamic = 'force-dynamic';

export default async function AdminEditCouponPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireAuth().catch(() => null);
  if (!session) redirect('/admin/login');

  const coupon = await prisma.coupon.findUnique({
    where: { id: params.id },
  });

  if (!coupon) {
    notFound();
  }

  return <EditCouponForm coupon={coupon} />;
}
