'use server';

import prisma from '@/lib/db';
import { requireAuth, recordAuditLog } from '@/lib/auth';
import { PaymentStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export interface PaymentActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface PaymentWithOrderRecord {
  orderId: string;
  amount: unknown;
  transactionId: string | null;
  rawResponseJson: string | null;
  order: { id: string; orderNumber: string };
}

function parseRawMeta(rawResponseJson: string | null): Record<string, any> {
  try {
    return rawResponseJson ? JSON.parse(rawResponseJson) : {};
  } catch {
    return {};
  }
}

async function getPaymentWithOrder(paymentId: string): Promise<PaymentWithOrderRecord | null> {
  try {
    return await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: { select: { id: true, orderNumber: true } },
      },
    });
  } catch (prismaErr) {
    const sb = createAdminClient();
    if (!sb) throw prismaErr;
    const { data, error } = await sb
      .from('payments')
      .select('orderId, amount, transactionId, rawResponseJson, order:orders(id, orderNumber)')
      .eq('id', paymentId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;

    const ord = Array.isArray(data.order) ? data.order[0] : data.order;
    return {
      orderId: data.orderId,
      amount: data.amount,
      transactionId: data.transactionId,
      rawResponseJson: data.rawResponseJson,
      order: ord || { id: data.orderId, orderNumber: '' },
    };
  }
}

async function applyPaymentAndOrderStatus(params: {
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
  paidAt?: Date;
  rawResponseJson: string;
  notes: string;
}) {
  const { paymentId, orderId, status, paidAt, rawResponseJson, notes } = params;

  try {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status,
          ...(paidAt ? { paidAt } : {}),
          rawResponseJson,
          notes,
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: status },
      }),
    ]);
  } catch (prismaErr) {
    const sb = createAdminClient();
    if (!sb) throw prismaErr;
    const nowIso = new Date().toISOString();
    const { error: payErr } = await sb
      .from('payments')
      .update({
        status,
        ...(paidAt ? { paidAt: paidAt.toISOString() } : {}),
        rawResponseJson,
        notes,
        updatedAt: nowIso,
      })
      .eq('id', paymentId);
    if (payErr) throw new Error(payErr.message);

    const { error: ordErr } = await sb
      .from('orders')
      .update({ paymentStatus: status, updatedAt: nowIso })
      .eq('id', orderId);
    if (ordErr) throw new Error(ordErr.message);
  }
}

/**
 * Admin action to manually verify a bKash or other pending payment
 */
export async function verifyPaymentAction(
  param: string | { paymentId: string; adminNote?: string },
  adminNoteParam?: string
): Promise<PaymentActionResponse> {
  try {
    const session = await requireAuth();

    const paymentId = typeof param === 'string' ? param : param.paymentId;
    const adminNote = (typeof param === 'object' ? param.adminNote : adminNoteParam) || '';
    const verifiedAt = new Date();

    const payment = await getPaymentWithOrder(paymentId);
    if (!payment) {
      return { success: false, error: 'Payment record not found.' };
    }

    const existingMeta = parseRawMeta(payment.rawResponseJson);
    const updatedMeta = {
      ...existingMeta,
      status: 'verified',
      verifiedAt: verifiedAt.toISOString(),
      verifiedBy: session.name,
      verifiedByEmail: session.email,
      adminNote: adminNote.trim() || existingMeta.adminNote || null,
    };

    const notesSummary = adminNote.trim()
      ? `Verified by ${session.name} (${session.email}) on ${verifiedAt.toLocaleDateString('en-BD')}. Note: ${adminNote.trim()}`
      : `Verified by ${session.name} (${session.email}) on ${verifiedAt.toLocaleDateString('en-BD')}`;

    await applyPaymentAndOrderStatus({
      paymentId,
      orderId: payment.orderId,
      status: PaymentStatus.PAID,
      paidAt: verifiedAt,
      rawResponseJson: JSON.stringify(updatedMeta),
      notes: notesSummary,
    });

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
        adminNote: adminNote.trim() || undefined,
      },
    });

    revalidatePath('/admin/payments');
    revalidatePath(`/admin/payments/${paymentId}`);
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
  param: string | { paymentId: string; rejectionReason?: string; adminNote?: string },
  reasonParam?: string,
  adminNoteParam?: string
): Promise<PaymentActionResponse> {
  try {
    const session = await requireAuth();

    const paymentId = typeof param === 'string' ? param : param.paymentId;
    const cleanReason = (
      (typeof param === 'object' ? param.rejectionReason : reasonParam) || 'Transaction could not be verified'
    ).trim();
    const adminNote = (typeof param === 'object' ? param.adminNote : adminNoteParam) || '';
    const rejectedAt = new Date();

    const payment = await getPaymentWithOrder(paymentId);
    if (!payment) {
      return { success: false, error: 'Payment record not found.' };
    }

    const existingMeta = parseRawMeta(payment.rawResponseJson);
    const updatedMeta = {
      ...existingMeta,
      status: 'rejected',
      rejectedAt: rejectedAt.toISOString(),
      rejectedBy: session.name,
      rejectionReason: cleanReason,
      adminNote: adminNote.trim() || existingMeta.adminNote || null,
    };

    const notesSummary = adminNote.trim()
      ? `Rejected: ${cleanReason} (by ${session.name} on ${rejectedAt.toLocaleDateString('en-BD')}). Note: ${adminNote.trim()}`
      : `Rejected: ${cleanReason} (by ${session.name} on ${rejectedAt.toLocaleDateString('en-BD')})`;

    await applyPaymentAndOrderStatus({
      paymentId,
      orderId: payment.orderId,
      status: PaymentStatus.FAILED,
      rawResponseJson: JSON.stringify(updatedMeta),
      notes: notesSummary,
    });

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
        adminNote: adminNote.trim() || undefined,
      },
    });

    revalidatePath('/admin/payments');
    revalidatePath(`/admin/payments/${paymentId}`);
    revalidatePath(`/admin/orders/${payment.orderId}`);
    return { success: true, message: `Payment for order #${payment.order.orderNumber} rejected.` };
  } catch (err: any) {
    console.error('Error rejecting payment:', err);
    return { success: false, error: err.message || 'Failed to reject payment.' };
  }
}
