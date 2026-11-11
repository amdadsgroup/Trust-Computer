import { Prisma, InventoryMovementType } from '@prisma/client';
import prisma from '@/lib/db';
import { getValidAdminUserId } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

class InventoryDomainError extends Error {}

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
  if (tx) {
    return adjustInventoryWithPrisma(params, tx);
  }

  try {
    return await adjustInventoryWithPrisma(params, prisma);
  } catch (err) {
    if (err instanceof InventoryDomainError) {
      throw err;
    }

    const sb = createAdminClient();
    if (!sb) throw err;

    const { data: product, error: prodErr } = await sb
      .from('products')
      .select('id, stock, name, sku')
      .eq('id', params.productId)
      .maybeSingle();

    if (prodErr) throw new Error(prodErr.message);
    if (!product) {
      throw new InventoryDomainError(`Product not found: ${params.productId}`);
    }

    const previousStock = product.stock;
    const newStock = previousStock + params.quantity;

    if (newStock < 0) {
      throw new InventoryDomainError(
        `Insufficient inventory for "${product.name}" (SKU: ${product.sku}). Available: ${previousStock}, Requested: ${Math.abs(params.quantity)}`
      );
    }

    const now = new Date().toISOString();
    const { data: updatedProduct, error: updErr } = await sb
      .from('products')
      .update({ stock: newStock, updatedAt: now })
      .eq('id', params.productId)
      .select()
      .single();

    if (updErr || !updatedProduct) {
      throw new Error(updErr?.message || 'Failed to update product stock.');
    }

    const validUserId = await getValidAdminUserId(params.userId);
    const { data: movement, error: movErr } = await sb
      .from('inventory_movements')
      .insert({
        id: crypto.randomUUID(),
        productId: params.productId,
        type: params.type,
        quantity: params.quantity,
        previousStock,
        newStock,
        reason: params.reason,
        referenceId: params.referenceId || null,
        createdByUserId: validUserId,
        createdAt: now,
      })
      .select()
      .single();

    if (movErr || !movement) {
      throw new Error(movErr?.message || 'Failed to record inventory movement.');
    }

    return { product: updatedProduct, movement };
  }
}

async function adjustInventoryWithPrisma(
  params: RecordMovementParams,
  client: Prisma.TransactionClient | typeof prisma
) {
  const product = await client.product.findUnique({
    where: { id: params.productId },
    select: { id: true, stock: true, name: true, sku: true },
  });

  if (!product) {
    throw new InventoryDomainError(`Product not found: ${params.productId}`);
  }

  const previousStock = product.stock;
  const newStock = previousStock + params.quantity;

  if (newStock < 0) {
    throw new InventoryDomainError(
      `Insufficient inventory for "${product.name}" (SKU: ${product.sku}). Available: ${previousStock}, Requested: ${Math.abs(params.quantity)}`
    );
  }

  const updatedProduct = await client.product.update({
    where: { id: params.productId },
    data: { stock: newStock },
  });

  const validUserId = await getValidAdminUserId(params.userId);

  const movement = await client.inventoryMovement.create({
    data: {
      productId: params.productId,
      type: params.type,
      quantity: params.quantity,
      previousStock,
      newStock,
      reason: params.reason,
      referenceId: params.referenceId,
      createdByUserId: validUserId,
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
  let products: Array<{ id: string; name: string; sku: string; stock: number; isActive: boolean }> = [];

  try {
    products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true, stock: true, isActive: true },
    });
  } catch (err) {
    const sb = createAdminClient();
    if (!sb) throw err;
    const { data, error } = await sb
      .from('products')
      .select('id, name, sku, stock, isActive')
      .in('id', productIds);
    if (error) throw new Error(error.message);
    products = data || [];
  }

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
