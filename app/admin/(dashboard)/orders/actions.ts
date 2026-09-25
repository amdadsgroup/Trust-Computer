'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, recordAuditLog } from '@/lib/auth';
import { updateOrderStatus } from '@/lib/orders';
import { OrderStatus } from '@prisma/client';
import prisma from '@/lib/db';

export async function changeOrderStatusAction(formData: FormData) {
  const session = await requireAuth();

  const orderId = formData.get('orderId') as string;
  const newStatus = formData.get('newStatus') as OrderStatus;
  const note = (formData.get('note') as string) || undefined;

  try {
    const updated = await updateOrderStatus({
      orderId,
      newStatus,
      note,
      userId: session.userId,
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'ORDER_STATUS_UPDATE',
      entityType: 'Order',
      entityId: orderId,
      details: { from: updated.status, to: newStatus, note },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to change order status:', error);
    return { error: error.message || 'অর্ডারের স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।' };
  }
}

export async function markPaymentAsPaidAction(orderId: string, transactionId?: string) {
  const session = await requireAuth();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID' },
      });

      await tx.payment.updateMany({
        where: { orderId },
        data: {
          status: 'PAID',
          transactionId: transactionId || `MANUAL-${Date.now()}`,
          paidAt: new Date(),
        },
      });
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'PAYMENT_STATUS_UPDATE',
      entityType: 'Payment',
      entityId: orderId,
      details: { status: 'PAID', transactionId },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'পেমেন্ট স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।' };
  }
}
