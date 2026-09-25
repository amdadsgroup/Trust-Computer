/**
 * Trust Computer — Coupon Validation Service
 * Server-side coupon validation with atomic usage tracking.
 */

import prisma from '@/lib/db';
import { CouponType } from '@prisma/client';

export interface CouponValidationInput {
  code: string;
  orderSubtotal: number;
  customerId?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  couponId?: string;
  code?: string;
  type?: CouponType;
  discountAmount?: number;
  message: string;
}

export async function validateCoupon(input: CouponValidationInput): Promise<CouponValidationResult> {
  const { code, orderSubtotal, customerId } = input;

  if (!code || code.trim().length === 0) {
    return { valid: false, message: 'Please enter a coupon code.' };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: {
      _count: { select: { usages: true } },
    },
  });

  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code. Please check and try again.' };
  }

  if (!coupon.isActive) {
    return { valid: false, message: 'This coupon is no longer active.' };
  }

  const now = new Date();

  if (coupon.startAt && now < coupon.startAt) {
    return { valid: false, message: 'This coupon is not yet active.' };
  }

  if (coupon.endAt && now > coupon.endAt) {
    return { valid: false, message: 'This coupon has expired.' };
  }

  // Check global usage limit
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'This coupon has reached its usage limit.' };
  }

  // Check minimum order value
  if (coupon.minimumOrderValue !== null && orderSubtotal < Number(coupon.minimumOrderValue)) {
    return {
      valid: false,
      message: `Minimum order value of ৳${Number(coupon.minimumOrderValue).toLocaleString('en-BD')} required for this coupon.`,
    };
  }

  // Check per-user usage limit if authenticated
  if (customerId && coupon.usageLimitPerUser > 0) {
    const userUsageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id, customerId },
    });

    if (userUsageCount >= coupon.usageLimitPerUser) {
      return { valid: false, message: 'You have already used this coupon the maximum number of times.' };
    }
  }

  // Calculate discount
  let discountAmount = 0;

  if (coupon.type === CouponType.PERCENTAGE) {
    discountAmount = (orderSubtotal * Number(coupon.value)) / 100;
    if (coupon.maximumDiscount !== null) {
      discountAmount = Math.min(discountAmount, Number(coupon.maximumDiscount));
    }
  } else if (coupon.type === CouponType.FIXED_AMOUNT) {
    discountAmount = Math.min(Number(coupon.value), orderSubtotal);
  } else if (coupon.type === CouponType.FREE_DELIVERY) {
    // Discount handled separately in checkout (waive delivery fee)
    discountAmount = 0;
  }

  discountAmount = Math.round(discountAmount * 100) / 100; // Round to 2 decimal places

  return {
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    type: coupon.type,
    discountAmount,
    message:
      coupon.type === CouponType.FREE_DELIVERY
        ? 'Free delivery coupon applied!'
        : `Coupon applied! You save ৳${discountAmount.toLocaleString('en-BD')}.`,
  };
}

/**
 * Record coupon usage atomically after a successful order.
 * Call this inside the order creation transaction.
 */
export async function recordCouponUsage(
  tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  params: {
    couponId: string;
    customerId?: string;
    orderId: string;
  }
) {
  await tx.couponUsage.create({
    data: {
      couponId: params.couponId,
      customerId: params.customerId ?? null,
      orderId: params.orderId,
    },
  });

  await tx.coupon.update({
    where: { id: params.couponId },
    data: { usedCount: { increment: 1 } },
  });
}
