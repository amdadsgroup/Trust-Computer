'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, recordAuditLog } from '@/lib/auth';
import { adjustInventory } from '@/lib/inventory';
import { InventoryMovementType } from '@prisma/client';
import { stockAdjustmentSchema } from '@/lib/validations';

export async function submitStockAdjustmentAction(formData: FormData) {
  const session = await requireAuth();

  const productId = formData.get('productId') as string;
  const type = formData.get('type') as InventoryMovementType;
  const quantity = parseInt(formData.get('quantity') as string, 10);
  const reason = (formData.get('reason') as string)?.trim();
  const referenceId = (formData.get('referenceId') as string) || undefined;

  const validation = stockAdjustmentSchema.safeParse({
    productId,
    type,
    quantity,
    reason,
    referenceId,
  });

  if (!validation.success) {
    return {
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    const result = await adjustInventory({
      productId,
      type,
      quantity,
      reason,
      referenceId,
      userId: session.userId,
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'STOCK_ADJUSTMENT',
      entityType: 'InventoryMovement',
      entityId: result.movement.id,
      details: {
        product: result.product.name,
        quantity,
        newStock: result.product.stock,
        reason,
      },
    });

    revalidatePath('/admin/inventory');
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to adjust stock:', error);
    return { error: error.message || 'স্টক সমন্বয়ে সমস্যা দেখা দিয়েছে।' };
  }
}
