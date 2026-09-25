import crypto from 'crypto';
import { OrderStatus, PaymentStatus, PaymentMethod, InventoryMovementType } from '@prisma/client';
import prisma from '@/lib/db';
import { adjustInventory } from '@/lib/inventory';
import { CheckoutInput } from '@/lib/validations';

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
 * Server-side order creation executing within a single atomic Prisma transaction.
 * Validates prices, prevents overselling, saves order snapshots, and creates audit history.
 */
export async function createOrderTransactionally(input: CheckoutInput) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current live products from database
    const productIds = input.items.map((i) => i.productId);
    const dbProducts = await tx.product.findMany({
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
      });
    }

    // 3. Compute delivery fee and final total
    const deliveryFee = calculateDeliveryFee(input.cityArea);
    const discount = 0; // Discount calculation can be expanded with coupons
    const total = subtotal + deliveryFee - discount;

    const orderNumber = generateOrderNumber();
    const trackingToken = generateTrackingToken();

    // 4. Create Order
    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId: input.customerId?.trim() || null,
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
        total,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: input.paymentMethod as PaymentMethod,
        trackingToken,
      },
    });

    // 5. Create Order Items with immutable snapshots
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

    // 6. Atomically decrement stock and record inventory movement
    for (const item of orderItemSnapshots) {
      await adjustInventory(
        {
          productId: item.productId,
          type: InventoryMovementType.SALE,
          quantity: -item.quantity,
          reason: `Customer order #${orderNumber}`,
          referenceId: order.id,
        },
        tx
      );
    }

    // 7. Create Payment Record
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

    // 8. Log initial status in OrderStatusHistory
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: OrderStatus.PENDING,
        toStatus: OrderStatus.PENDING,
        note: 'Order submitted by customer via web storefront',
      },
    });

    return order;
  });
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
  return await prisma.$transaction(async (tx) => {
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
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: params.newStatus,
        note: params.note || `Status updated to ${params.newStatus}`,
        changedByUserId: params.userId,
      },
    });

    return updatedOrder;
  });
}
