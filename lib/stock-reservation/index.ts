/**
 * Trust Computer — Stock Reservation Service
 * Prevents overselling on concurrent purchases by reserving stock
 * at checkout initiation and releasing on expiry or order confirmation.
 *
 * Flow:
 * 1. Customer initiates checkout → reserveStock() per item
 * 2. Order confirmed/paid → confirmReservations() → decrement product.stock
 * 3. Reservation expires (15 min) → releaseExpiredReservations() → stock freed
 * 4. Checkout abandoned → releaseReservations() → stock freed immediately
 */

import prisma from '@/lib/db';
import { ReservationStatus } from '@prisma/client';

export const RESERVATION_TTL_MINUTES = 15;

export interface ReservationRequest {
  productId: string;
  quantity: number;
  sessionKey: string;
}

export interface ReservationResult {
  success: boolean;
  reservationId?: string;
  message?: string;
}

/**
 * Reserve stock for a single product atomically.
 * Uses a transaction to check available stock and create a reservation.
 */
export async function reserveStock(request: ReservationRequest): Promise<ReservationResult> {
  const { productId, quantity, sessionKey } = request;
  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Calculate available stock: physical stock minus active reservations
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { stock: true, name: true, isActive: true },
      });

      if (!product || !product.isActive) {
        throw new Error(`Product not available.`);
      }

      const activeReservations = await tx.stockReservation.aggregate({
        where: {
          productId,
          status: ReservationStatus.ACTIVE,
          expiresAt: { gt: new Date() },
        },
        _sum: { quantity: true },
      });

      const reservedQty = activeReservations._sum.quantity ?? 0;
      const availableQty = product.stock - reservedQty;

      if (availableQty < quantity) {
        throw new Error(
          `Only ${availableQty} unit(s) available for "${product.name}". Cannot reserve ${quantity}.`
        );
      }

      // Release any previous active reservations for the same session+product
      await tx.stockReservation.updateMany({
        where: { productId, sessionKey, status: ReservationStatus.ACTIVE },
        data: { status: ReservationStatus.RELEASED, releasedAt: new Date() },
      });

      const reservation = await tx.stockReservation.create({
        data: { productId, quantity, sessionKey, status: ReservationStatus.ACTIVE, expiresAt },
      });

      return reservation;
    });

    return { success: true, reservationId: result.id };
  } catch (error: any) {
    return { success: false, message: error?.message ?? 'Failed to reserve stock.' };
  }
}

/**
 * Reserve stock for multiple items in a single checkout session.
 * If any item fails, all previous reservations are released.
 */
export async function reserveMultipleItems(
  items: ReservationRequest[]
): Promise<{ success: boolean; failedItem?: string; message?: string }> {
  const createdIds: string[] = [];

  for (const item of items) {
    const result = await reserveStock(item);
    if (!result.success) {
      // Release all previously created reservations for this session
      await releaseReservationsByIds(createdIds);
      return { success: false, failedItem: item.productId, message: result.message };
    }
    if (result.reservationId) createdIds.push(result.reservationId);
  }

  return { success: true };
}

/**
 * Confirm reservations after a successful order payment/placement.
 * This atomically decrements product.stock and records the inventory movement.
 */
export async function confirmReservations(
  sessionKey: string,
  orderId: string,
  adminUserId?: string
): Promise<void> {
  const activeReservations = await prisma.stockReservation.findMany({
    where: { sessionKey, status: ReservationStatus.ACTIVE },
    include: { product: true },
  });

  await prisma.$transaction(async (tx) => {
    for (const reservation of activeReservations) {
      const product = await tx.product.findUnique({
        where: { id: reservation.productId },
        select: { stock: true },
      });

      if (!product) continue;

      const newStock = Math.max(0, product.stock - reservation.quantity);

      await tx.product.update({
        where: { id: reservation.productId },
        data: { stock: newStock },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: reservation.productId,
          type: 'SALE',
          quantity: -reservation.quantity,
          previousStock: product.stock,
          newStock,
          reason: `Sale via order ${orderId}`,
          referenceId: orderId,
          createdByUserId: adminUserId ?? null,
        },
      });

      await tx.stockReservation.update({
        where: { id: reservation.id },
        data: { status: ReservationStatus.CONFIRMED, confirmedAt: new Date() },
      });
    }
  });
}

/**
 * Release reservations for a session (e.g. checkout abandoned or payment failed).
 */
export async function releaseReservations(sessionKey: string): Promise<void> {
  await prisma.stockReservation.updateMany({
    where: { sessionKey, status: ReservationStatus.ACTIVE },
    data: { status: ReservationStatus.RELEASED, releasedAt: new Date() },
  });
}

/**
 * Release specific reservations by their IDs.
 */
export async function releaseReservationsByIds(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await prisma.stockReservation.updateMany({
    where: { id: { in: ids }, status: ReservationStatus.ACTIVE },
    data: { status: ReservationStatus.RELEASED, releasedAt: new Date() },
  });
}

/**
 * Release all expired reservations (call this from a cron job or at checkout time).
 * Returns the number of expired reservations released.
 */
export async function releaseExpiredReservations(): Promise<number> {
  const result = await prisma.stockReservation.updateMany({
    where: {
      status: ReservationStatus.ACTIVE,
      expiresAt: { lt: new Date() },
    },
    data: { status: ReservationStatus.EXPIRED, releasedAt: new Date() },
  });

  return result.count;
}

/**
 * Get the available stock for a product (accounting for active non-expired reservations).
 */
export async function getAvailableStock(productId: string): Promise<number> {
  const [product, reservations] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId }, select: { stock: true } }),
    prisma.stockReservation.aggregate({
      where: {
        productId,
        status: ReservationStatus.ACTIVE,
        expiresAt: { gt: new Date() },
      },
      _sum: { quantity: true },
    }),
  ]);

  if (!product) return 0;

  const reservedQty = reservations._sum.quantity ?? 0;
  return Math.max(0, product.stock - reservedQty);
}
