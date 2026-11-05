import React from 'react';
import { notFound } from 'next/navigation';
import PaymentDetailsCard, { PaymentDetailsData } from '@/components/admin/PaymentDetailsCard';
import { business } from '@/lib/business';
import { getAdminPaymentDetail } from '@/lib/db/admin-service';

export const dynamic = 'force-dynamic';

interface PaymentDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AdminPaymentDetailPage({ params }: PaymentDetailPageProps) {
  const payment = await getAdminPaymentDetail(params.id);

  if (!payment) {
    notFound();
  }

  let meta: Record<string, any> = {};
  try {
    if (payment.rawResponseJson) {
      meta = JSON.parse(payment.rawResponseJson);
    }
  } catch {
    meta = {};
  }

  const paymentData: PaymentDetailsData = {
    id: payment.id,
    orderId: payment.orderId,
    orderNumber: payment.order.orderNumber,
    customerName: payment.order.customerName,
    customerPhone: payment.order.customerPhone,
    provider: payment.provider,
    amount: Number(payment.amount),
    currency: payment.currency,
    status: payment.status,
    transactionId: payment.transactionId,
    receiverNumber: meta.receiverNumber || meta.paymentNumber || business.payment.bkash,
    senderNumber: meta.senderNumber || null,
    submittedAt: meta.submittedAt || payment.createdAt.toISOString(),
    paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
    verifiedBy: meta.verifiedBy || null,
    rejectionReason: meta.rejectionReason || null,
    rejectedBy: meta.rejectedBy || null,
    rejectedAt: meta.rejectedAt || null,
    adminNote: meta.adminNote || null,
    notes: payment.notes || null,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PaymentDetailsCard payment={paymentData} isStandalonePage={true} />
    </div>
  );
}
