import { Prisma, InventoryMovementType } from '@prisma/client';
import prisma from '@/lib/db';

export interface RecordMovementParams {
  productId: string;
  type: InventoryMovementType;
  quantity: number; // positive for addition, negative for reduction
  reason: string;
  referenceId?: string;
  userId?: string;
}

/**
 * Transactionally adjusts product stock and writes an immutable audit record to InventoryMovement.
 * If decrementing and stock would drop below 0, it throws an error to prevent overselling.
 */
export async function adjustInventory(
  params: RecordMovementParams,
  tx?: Prisma.TransactionClient
) {
  const client = tx || prisma;

  // 1. Fetch current product stock
  const product = await client.product.findUnique({
    where: { id: params.productId },
    select: { id: true, stock: true, name: true, sku: true },
  });

  if (!product) {
    throw new Error(`Product not found: ${params.productId}`);
  }

  const previousStock = product.stock;
  const newStock = previousStock + params.quantity;

  if (newStock < 0) {
    throw new Error(
      `Insufficient inventory for "${product.name}" (SKU: ${product.sku}). Available: ${previousStock}, Requested: ${Math.abs(params.quantity)}`
    );
  }

  // 2. Update product stock atomically
  const updatedProduct = await client.product.update({
    where: { id: params.productId },
    data: { stock: newStock },
  });

  // 3. Record immutable inventory movement ledger
  const movement = await client.inventoryMovement.create({
    data: {
      productId: params.productId,
      type: params.type,
      quantity: params.quantity,
      previousStock,
      newStock,
      reason: params.reason,
      referenceId: params.referenceId,
      createdByUserId: params.userId,
    },
  });

  return { product: updatedProduct, movement };
}

/**
 * Verifies that all items in an order are currently available in sufficient quantity.
 * Throws with detailed list of unavailable items if stock is insufficient.
 */
export async function verifyStockAvailability(
  items: Array<{ productId: string; quantity: number }>
) {
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true, stock: true, isActive: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));
  const errors: string[] = [];

  for (const item of items) {
    const prod = productMap.get(item.productId);
    if (!prod) {
      errors.push(`Product ID ${item.productId} was not found.`);
      continue;
    }
    if (!prod.isActive) {
      errors.push(`"${prod.name}" is currently unavailable.`);
      continue;
    }
    if (prod.stock < item.quantity) {
      errors.push(
        `Insufficient stock for "${prod.name}" (SKU: ${prod.sku}). Only ${prod.stock} left in stock.`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return products;
}
