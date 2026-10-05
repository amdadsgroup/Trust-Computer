'use server';

import prisma from '@/lib/db';
import { requireAuth, recordAuditLog } from '@/lib/auth';
import { PaymentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export interface PaymentActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Admin action to manually verify a bKash or other pending payment
 */
export async function verifyPaymentAction(paymentId: string): Promise<PaymentActionResponse> {
  try {
    const session = await requireAuth();

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: { id: true, orderNumber: true },
        },
      },
    });

    if (!payment) {
      return { success: false, error: 'Payment record not found.' };
    }

    let existingMeta: Record<string, any> = {};
    try {
      if (payment.rawResponseJson) {
        existingMeta = JSON.parse(payment.rawResponseJson);
      }
    } catch {
      existingMeta = {};
    }

    const verifiedAt = new Date();
    const updatedMeta = {
      ...existingMeta,
      status: 'verified',
      verifiedAt: verifiedAt.toISOString(),
      verifiedBy: session.name,
      verifiedByEmail: session.email,
    };

    // Transactionally update payment and order status
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.PAID,
          paidAt: verifiedAt,
          rawResponseJson: JSON.stringify(updatedMeta),
          notes: `Verified by ${session.name} (${session.email}) on ${verifiedAt.toLocaleDateString('en-BD')}`,
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
        },
      }),
    ]);

    await recordAuditLog({
      userId: session.userId,
      action: 'PAYMENT_VERIFIED',
      entityType: 'Payment',
      entityId: paymentId,
      details: {
        orderNumber: payment.order.orderNumber,
        amount: Number(payment.amount),
        transactionId: payment.transactionId,
        verifiedBy: session.name,
      },
    });

    revalidatePath('/admin/payments');
    revalidatePath(`/admin/orders/${payment.orderId}`);
    return { success: true, message: `Payment for order #${payment.order.orderNumber} successfully verified.` };
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    return { success: false, error: err.message || 'Failed to verify payment.' };
  }
}

/**
 * Admin action to reject a fraudulent or unverified bKash payment
 */
export async function rejectPaymentAction(
  paymentId: string,
  reason: string
): Promise<PaymentActionResponse> {
  try {
    const session = await requireAuth();

    const cleanReason = (reason || 'Transaction could not be verified').trim();

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: { id: true, orderNumber: true },
        },
      },
    });

    if (!payment) {
      return { success: false, error: 'Payment record not found.' };
    }

    let existingMeta: Record<string, any> = {};
    try {
      if (payment.rawResponseJson) {
        existingMeta = JSON.parse(payment.rawResponseJson);
      }
    } catch {
      existingMeta = {};
    }

    const rejectedAt = new Date();
    const updatedMeta = {
      ...existingMeta,
      status: 'rejected',
      rejectedAt: rejectedAt.toISOString(),
      rejectedBy: session.name,
      rejectionReason: cleanReason,
    };

    // Transactionally update payment and order status without deleting transaction records
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.FAILED,
          rawResponseJson: JSON.stringify(updatedMeta),
          notes: `Rejected: ${cleanReason} (by ${session.name} on ${rejectedAt.toLocaleDateString('en-BD')})`,
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: PaymentStatus.FAILED,
        },
      }),
    ]);

    await recordAuditLog({
      userId: session.userId,
      action: 'PAYMENT_REJECTED',
      entityType: 'Payment',
      entityId: paymentId,
      details: {
        orderNumber: payment.order.orderNumber,
        amount: Number(payment.amount),
        transactionId: payment.transactionId,
        rejectionReason: cleanReason,
        rejectedBy: session.name,
      },
    });

    revalidatePath('/admin/payments');
    revalidatePath(`/admin/orders/${payment.orderId}`);
    return { success: true, message: `Payment for order #${payment.order.orderNumber} rejected.` };
  } catch (err: any) {
    console.error('Error rejecting payment:', err);
    return { success: false, error: err.message || 'Failed to reject payment.' };
  }
}
