'use server';

import prisma from '@/lib/db';
import { requireRole, recordAuditLog } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { CouponType } from '@prisma/client';
import { createAdminClient } from '@/lib/supabase/admin';

function parseCouponFormData(formData: FormData) {
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

  return {
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
  };
}

export async function createCouponAction(formData: FormData) {
  const session = await requireRole(['OWNER', 'ADMIN']);
  const parsed = parseCouponFormData(formData);

  if (!parsed.code) {
    return { error: 'Coupon code is required.' };
  }

  try {
    let couponId: string;
    try {
      const existing = await prisma.coupon.findUnique({
        where: { code: parsed.code },
      });

      if (existing) {
        return { error: `Coupon code "${parsed.code}" already exists. Please choose a different code.` };
      }

      const coupon = await prisma.coupon.create({ data: parsed });
      couponId = coupon.id;
    } catch (prismaErr) {
      const sb = createAdminClient();
      if (!sb) throw prismaErr;

      const { data: existing } = await sb
        .from('coupons')
        .select('id')
        .eq('code', parsed.code)
        .maybeSingle();
      if (existing) {
        return { error: `Coupon code "${parsed.code}" already exists. Please choose a different code.` };
      }

      const now = new Date().toISOString();
      const { data: created, error } = await sb
        .from('coupons')
        .insert({
          id: crypto.randomUUID(),
          ...parsed,
          startAt: parsed.startAt ? parsed.startAt.toISOString() : null,
          endAt: parsed.endAt ? parsed.endAt.toISOString() : null,
          usedCount: 0,
          createdAt: now,
          updatedAt: now,
        })
        .select('id')
        .single();
      if (error || !created) throw new Error(error?.message || 'Failed to create coupon.');
      couponId = created.id;
    }

    await recordAuditLog({
      userId: session.userId,
      action: 'COUPON_CREATE',
      entityType: 'Coupon',
      entityId: couponId,
      details: { code: parsed.code, type: parsed.type, value: parsed.value },
    });

    revalidatePath('/admin/coupons');
    return { success: true, couponId };
  } catch (error: any) {
    console.error('Failed to create coupon:', error);
    return { error: error.message || 'Failed to create coupon.' };
  }
}

export async function updateCouponAction(id: string, formData: FormData) {
  const session = await requireRole(['OWNER', 'ADMIN']);
  const parsed = parseCouponFormData(formData);

  if (!parsed.code) {
    return { error: 'Coupon code is required.' };
  }

  try {
    try {
      const existing = await prisma.coupon.findFirst({
        where: { code: parsed.code, NOT: { id } },
      });

      if (existing) {
        return { error: `Another coupon with code "${parsed.code}" already exists.` };
      }

      await prisma.coupon.update({
        where: { id },
        data: parsed,
      });
    } catch (prismaErr) {
      const sb = createAdminClient();
      if (!sb) throw prismaErr;

      const { data: existing } = await sb
        .from('coupons')
        .select('id')
        .eq('code', parsed.code)
        .neq('id', id)
        .maybeSingle();
      if (existing) {
        return { error: `Another coupon with code "${parsed.code}" already exists.` };
      }

      const { error } = await sb
        .from('coupons')
        .update({
          ...parsed,
          startAt: parsed.startAt ? parsed.startAt.toISOString() : null,
          endAt: parsed.endAt ? parsed.endAt.toISOString() : null,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw new Error(error.message);
    }

    await recordAuditLog({
      userId: session.userId,
      action: 'COUPON_UPDATE',
      entityType: 'Coupon',
      entityId: id,
      details: { code: parsed.code, type: parsed.type, value: parsed.value },
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
    let newState = !currentState;
    try {
      const updated = await prisma.coupon.update({
        where: { id },
        data: { isActive: newState },
      });
      newState = updated.isActive;
    } catch (prismaErr) {
      const sb = createAdminClient();
      if (!sb) throw prismaErr;
      const { data: updated, error } = await sb
        .from('coupons')
        .update({ isActive: newState, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .select('isActive')
        .single();
      if (error || !updated) throw new Error(error?.message || 'Failed to toggle coupon status.');
      newState = updated.isActive;
    }

    await recordAuditLog({
      userId: session.userId,
      action: 'COUPON_TOGGLE_ACTIVE',
      entityType: 'Coupon',
      entityId: id,
      details: { newState },
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
    try {
      await prisma.couponUsage.deleteMany({ where: { couponId: id } });
      await prisma.coupon.delete({ where: { id } });
    } catch (prismaErr) {
      const sb = createAdminClient();
      if (!sb) throw prismaErr;
      await sb.from('coupon_usages').delete().eq('couponId', id);
      const { error } = await sb.from('coupons').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }

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
