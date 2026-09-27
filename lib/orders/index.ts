import crypto from 'crypto';
import { OrderStatus, PaymentStatus, PaymentMethod, InventoryMovementType, CouponType } from '@prisma/client';
import prisma from '@/lib/db';
import { adjustInventory } from '@/lib/inventory';
import { CheckoutInput } from '@/lib/validations';
import { getValidAdminUserId } from '@/lib/auth';
import { validateCoupon } from '@/lib/coupons';

/**
 * Valid order status transitions state machine
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
  [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.RETURNED]: [],
};

export function isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  if (currentStatus === newStatus) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

/**
 * Generates an order number in format: TC-YYYYMMDD-XXXX
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `TC-${yyyy}${mm}${dd}-${randomSuffix}`;
}

/**
 * Generates a secure random tracking token
 */
export function generateTrackingToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Calculates delivery fee based on selected zone
 */
export function calculateDeliveryFee(cityArea: string): number {
  const lower = cityArea.toLowerCase();
  // Moulvibazar Sadar or inside Moulvibazar town
  if (lower.includes('sadar') || lower.includes('kusumbagh') || lower.includes('moulvibazar town')) {
    return 60; // ৳60 for local delivery
  }
  return 120; // ৳120 for upazilas / outside Moulvibazar sadar
}

/**
 * Server-side order creation executing with pre-validation and fast atomic Prisma transaction.
 * Validates prices, checks and applies coupons, decrements stock atomically, and creates audit history.
 */
export async function createOrderTransactionally(input: CheckoutInput) {
  // 1. Fetch current live products from database
  const productIds = input.items.map((i) => i.productId);
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });

  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  // 2. Validate all products, active state, and calculate subtotal
  let subtotal = 0;
  const orderItemSnapshots: Array<{
    productId: string;
    productName: string;
    productSku: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    warrantyInfo: string | null;
    imageSnapshot: string | null;
    currentStock: number;
  }> = [];

  for (const item of input.items) {
    const prod = productMap.get(item.productId);
    if (!prod) {
      throw new Error(`Product not found: ${item.productId}`);
    }
    if (!prod.isActive) {
      throw new Error(`Product "${prod.name}" is no longer available.`);
    }
    if (prod.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for "${prod.name}". Available: ${prod.stock}, requested: ${item.quantity}`
      );
    }

    const unitPrice = Number(prod.sellingPrice);
    const itemSubtotal = unitPrice * item.quantity;
    subtotal += itemSubtotal;

    orderItemSnapshots.push({
      productId: prod.id,
      productName: prod.name,
      productSku: prod.sku,
      unitPrice,
      quantity: item.quantity,
      subtotal: itemSubtotal,
      warrantyInfo: prod.warrantyInfo,
      imageSnapshot: prod.images[0]?.url || null,
      currentStock: prod.stock,
    });
  }

  // 3. Validate customerId if provided to prevent foreign key errors
  let validCustomerId: string | null = null;
  if (input.customerId?.trim()) {
    const customerExists = await prisma.customerProfile.findUnique({
      where: { id: input.customerId.trim() },
      select: { id: true },
    });
    if (customerExists) {
      validCustomerId = customerExists.id;
    }
  }

  // 4. Compute delivery fee, coupon discount and final total
  let deliveryFee = calculateDeliveryFee(input.cityArea);
  let discount = 0;
  let couponDiscount = 0;
  let appliedCouponId: string | null = null;
  let appliedCouponCode: string | null = null;

  if (input.couponCode && input.couponCode.trim()) {
    const couponValidation = await validateCoupon({
      code: input.couponCode.trim(),
      orderSubtotal: subtotal,
      customerId: validCustomerId || undefined,
    });

    if (couponValidation.valid && couponValidation.couponId) {
      appliedCouponId = couponValidation.couponId;
      appliedCouponCode = couponValidation.code || input.couponCode.trim().toUpperCase();

      if (couponValidation.type === CouponType.FREE_DELIVERY) {
        discount = deliveryFee;
        couponDiscount = deliveryFee;
        deliveryFee = 0;
      } else {
        discount = couponValidation.discountAmount || 0;
        couponDiscount = discount;
      }
    } else {
      throw new Error(couponValidation.message || 'Invalid coupon code applied.');
    }
  }

  const total = Math.max(0, subtotal + deliveryFee - discount);
  const orderNumber = generateOrderNumber();
  const trackingToken = generateTrackingToken();

  // 5. Execute transactional write operations with safe timeouts
  return await prisma.$transaction(
    async (tx) => {
      // 5.1 Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: validCustomerId,
          customerName: input.customerName.trim(),
          customerPhone: input.customerPhone.trim(),
          customerEmail: input.customerEmail?.trim() || null,
          deliveryAddress: input.deliveryAddress.trim(),
          cityArea: input.cityArea.trim(),
          notes: input.notes?.trim() || null,
          deliveryMethod: input.deliveryMethod,
          deliveryFee,
          subtotal,
          discount,
          couponCode: appliedCouponCode,
          couponDiscount,
          total,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: input.paymentMethod as PaymentMethod,
          trackingToken,
        },
      });

      // 5.2 Create Order Items with immutable snapshots
      await tx.orderItem.createMany({
        data: orderItemSnapshots.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          subtotal: item.subtotal,
          warrantyInfo: item.warrantyInfo,
          imageSnapshot: item.imageSnapshot,
        })),
      });

      // 5.3 Decrement stock and record inventory movement
      const inventoryMovementsData = [];
      for (const item of orderItemSnapshots) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        inventoryMovementsData.push({
          productId: item.productId,
          type: InventoryMovementType.SALE,
          quantity: -item.quantity,
          previousStock: item.currentStock,
          newStock: item.currentStock - item.quantity,
          reason: `Customer order #${orderNumber}`,
          referenceId: order.id,
        });
      }

      await tx.inventoryMovement.createMany({
        data: inventoryMovementsData,
      });

      // 5.4 Create Payment Record
      await tx.payment.create({
        data: {
          orderId: order.id,
          provider: input.paymentMethod as PaymentMethod,
          amount: total,
          currency: 'BDT',
          status: PaymentStatus.PENDING,
          notes: `Initial payment record created for order ${orderNumber}`,
        },
      });

      // 5.5 Log initial status in OrderStatusHistory
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: OrderStatus.PENDING,
          toStatus: OrderStatus.PENDING,
          note: 'Order submitted by customer via web storefront',
        },
      });

      // 5.6 Record coupon usage atomically
      if (appliedCouponId) {
        await tx.couponUsage.create({
          data: {
            couponId: appliedCouponId,
            customerId: validCustomerId,
            orderId: order.id,
          },
        });

        await tx.coupon.update({
          where: { id: appliedCouponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return order;
    },
    {
      maxWait: 15000,
      timeout: 30000,
    }
  );
}

/**
 * Updates order status safely with transition validation and audit logging.
 * Restocks inventory if cancelled or returned.
 */
export async function updateOrderStatus(params: {
  orderId: string;
  newStatus: OrderStatus;
  note?: string;
  userId?: string;
}) {
  return await prisma.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: params.orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error(`Order not found: ${params.orderId}`);
      }

      if (!isValidStatusTransition(order.status, params.newStatus)) {
        throw new Error(
          `Invalid status transition from "${order.status}" to "${params.newStatus}".`
        );
      }

      // If order is transitioning to CANCELLED or RETURNED, restock inventory
      const isCancelling =
        params.newStatus === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED;
      const isReturning =
        params.newStatus === OrderStatus.RETURNED && order.status !== OrderStatus.RETURNED;

      if (isCancelling || isReturning) {
        for (const item of order.items) {
          if (item.productId) {
            await adjustInventory(
              {
                productId: item.productId,
                type: isReturning ? InventoryMovementType.RETURN : InventoryMovementType.RESERVATION_RELEASE,
                quantity: item.quantity,
                reason: `Stock restored: Order #${order.orderNumber} ${params.newStatus}`,
                referenceId: order.id,
                userId: params.userId,
              },
              tx
            );
          }
        }
      }

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: params.orderId },
        data: { status: params.newStatus },
      });

      // Record status transition in history
      const validUserId = await getValidAdminUserId(params.userId);
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: params.newStatus,
          note: params.note || `Status updated to ${params.newStatus}`,
          changedByUserId: validUserId,
        },
      });

      return updatedOrder;
    },
    {
      maxWait: 15000,
      timeout: 30000,
    }
  );
}
