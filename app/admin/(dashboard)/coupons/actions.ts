'use server';

import prisma from '@/lib/db';
import { requireRole, recordAuditLog } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { CouponType } from '@prisma/client';

export async function createCouponAction(formData: FormData) {
  const session = await requireRole(['OWNER', 'ADMIN']);

  const code = (formData.get('code') as string)?.trim().toUpperCase();
  const description = (formData.get('description') as string)?.trim() || null;
  const type = (formData.get('type') as CouponType) || CouponType.PERCENTAGE;
  const value = parseFloat(formData.get('value') as string) || 0;
  const minimumOrderValueRaw = formData.get('minimumOrderValue') as string;
  const minimumOrderValue = minimumOrderValueRaw ? parseFloat(minimumOrderValueRaw) : null;
  const maximumDiscountRaw = formData.get('maximumDiscount') as string;
  const maximumDiscount = maximumDiscountRaw ? parseFloat(maximumDiscountRaw) : null;
  const usageLimitRaw = formData.get('usageLimit') as string;
  const usageLimit = usageLimitRaw ? parseInt(usageLimitRaw, 10) : null;
  const usageLimitPerUser = parseInt(formData.get('usageLimitPerUser') as string, 10) || 1;
  const isActive = formData.get('isActive') === 'on' || formData.get('isActive') === 'true';
  const startAtRaw = formData.get('startAt') as string;
  const startAt = startAtRaw ? new Date(startAtRaw) : null;
  const endAtRaw = formData.get('endAt') as string;
  const endAt = endAtRaw ? new Date(endAtRaw) : null;

  if (!code) {
    return { error: 'Coupon code is required.' };
  }

  try {
    const existing = await prisma.coupon.findUnique({
      where: { code },
    });

    if (existing) {
      return { error: `Coupon code "${code}" already exists. Please choose a different code.` };
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description,
        type,
        value,
        minimumOrderValue,
        maximumDiscount,
        usageLimit,
        usageLimitPerUser,
        isActive,
        startAt,
        endAt,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'COUPON_CREATE',
      entityType: 'Coupon',
      entityId: coupon.id,
      details: { code, type, value },
    });

    revalidatePath('/admin/coupons');
    return { success: true, couponId: coupon.id };
  } catch (error: any) {
    console.error('Failed to create coupon:', error);
    return { error: error.message || 'Failed to create coupon.' };
  }
}

export async function updateCouponAction(id: string, formData: FormData) {
  const session = await requireRole(['OWNER', 'ADMIN']);

  const code = (formData.get('code') as string)?.trim().toUpperCase();
  const description = (formData.get('description') as string)?.trim() || null;
  const type = (formData.get('type') as CouponType) || CouponType.PERCENTAGE;
  const value = parseFloat(formData.get('value') as string) || 0;
  const minimumOrderValueRaw = formData.get('minimumOrderValue') as string;
  const minimumOrderValue = minimumOrderValueRaw ? parseFloat(minimumOrderValueRaw) : null;
  const maximumDiscountRaw = formData.get('maximumDiscount') as string;
  const maximumDiscount = maximumDiscountRaw ? parseFloat(maximumDiscountRaw) : null;
  const usageLimitRaw = formData.get('usageLimit') as string;
  const usageLimit = usageLimitRaw ? parseInt(usageLimitRaw, 10) : null;
  const usageLimitPerUser = parseInt(formData.get('usageLimitPerUser') as string, 10) || 1;
  const isActive = formData.get('isActive') === 'on' || formData.get('isActive') === 'true';
  const startAtRaw = formData.get('startAt') as string;
  const startAt = startAtRaw ? new Date(startAtRaw) : null;
  const endAtRaw = formData.get('endAt') as string;
  const endAt = endAtRaw ? new Date(endAtRaw) : null;

  if (!code) {
    return { error: 'Coupon code is required.' };
  }

  try {
    const existing = await prisma.coupon.findFirst({
      where: { code, NOT: { id } },
    });

    if (existing) {
      return { error: `Another coupon with code "${code}" already exists.` };
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        code,
        description,
        type,
        value,
        minimumOrderValue,
        maximumDiscount,
        usageLimit,
        usageLimitPerUser,
        isActive,
        startAt,
        endAt,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'COUPON_UPDATE',
      entityType: 'Coupon',
      entityId: updated.id,
      details: { code, type, value },
    });

    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update coupon:', error);
    return { error: error.message || 'Failed to update coupon.' };
  }
}

export async function toggleCouponActiveAction(id: string, currentState: boolean) {
  const session = await requireRole(['OWNER', 'ADMIN']);

  try {
    const updated = await prisma.coupon.update({
      where: { id },
      data: { isActive: !currentState },
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'COUPON_TOGGLE_ACTIVE',
      entityType: 'Coupon',
      entityId: id,
      details: { newState: updated.isActive },
    });

    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to toggle coupon status.' };
  }
}

export async function deleteCouponAction(id: string) {
  const session = await requireRole(['OWNER', 'ADMIN']);

  try {
    await prisma.couponUsage.deleteMany({ where: { couponId: id } });
    await prisma.coupon.delete({ where: { id } });

    await recordAuditLog({
      userId: session.userId,
      action: 'COUPON_DELETE',
      entityType: 'Coupon',
      entityId: id,
      details: {},
    });

    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to delete coupon.' };
  }
}
