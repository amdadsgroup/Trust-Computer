'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, recordAuditLog } from '@/lib/auth';
import { updateOrderStatus } from '@/lib/orders';
import { OrderStatus } from '@prisma/client';
import prisma from '@/lib/db';
import { createAdminClient } from '@/lib/supabase/admin';

export async function changeOrderStatusAction(formData: FormData) {
  const session = await requireAuth();

  const orderId = formData.get('orderId') as string;
  const newStatus = formData.get('newStatus') as OrderStatus;
  const note = (formData.get('note') as string) || undefined;

  let previousStatus = 'PENDING';

  try {
    try {
      const updated = await updateOrderStatus({
        orderId,
        newStatus,
        note,
        userId: session.userId,
      });
      previousStatus = updated.status;
    } catch (dbErr) {
      const sb = createAdminClient();
      if (!sb) throw dbErr;
      const { data: currOrder } = await sb.from('orders').select('status').eq('id', orderId).single();
      if (currOrder) previousStatus = currOrder.status;
      await sb.from('orders').update({ status: newStatus, updatedAt: new Date().toISOString() }).eq('id', orderId);
      await sb.from('order_status_history').insert({
        orderId,
        fromStatus: previousStatus,
        toStatus: newStatus,
        note: note || null,
        changedBy: session.userId || null,
      });
    }

    await recordAuditLog({
      userId: session.userId,
      action: 'ORDER_STATUS_UPDATE',
      entityType: 'Order',
      entityId: orderId,
      details: { from: previousStatus, to: newStatus, note },
    });

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to change order status:', error);
    return { error: error.message || 'Failed to update order status.' };
  }
}

export async function markPaymentAsPaidAction(orderId: string, transactionId?: string) {
  const session = await requireAuth();

  try {
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
    } catch (dbErr) {
      const sb = createAdminClient();
      if (!sb) throw dbErr;
      await sb.from('orders').update({ paymentStatus: 'PAID', updatedAt: new Date().toISOString() }).eq('id', orderId);
      await sb.from('payments').update({
        status: 'PAID',
        transactionId: transactionId || `MANUAL-${Date.now()}`,
        paidAt: new Date().toISOString(),
      }).eq('orderId', orderId);
    }

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
    return { error: e.message || 'Failed to update payment status.' };
  }
}
