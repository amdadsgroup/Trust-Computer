'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { requireAuth, recordAuditLog } from '@/lib/auth';
import { productCreateSchema } from '@/lib/validations';
import { adjustInventory } from '@/lib/inventory';
import { InventoryMovementType } from '@prisma/client';

export async function createProductAction(formData: FormData) {
  const session = await requireAuth();

  const name = formData.get('name') as string;
  const slug = (formData.get('slug') as string)?.toLowerCase().trim();
  const sku = (formData.get('sku') as string)?.trim();
  const barcode = (formData.get('barcode') as string) || null;
  const description = formData.get('description') as string;
  const sellingPrice = parseFloat(formData.get('sellingPrice') as string);
  const compareAtPrice = formData.get('compareAtPrice')
    ? parseFloat(formData.get('compareAtPrice') as string)
    : null;
  const costPrice = formData.get('costPrice')
    ? parseFloat(formData.get('costPrice') as string)
    : null;
  const stock = parseInt(formData.get('stock') as string, 10) || 0;
  const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string, 10) || 3;
  const isFeatured = formData.get('isFeatured') === 'on';
  const isNewArrival = formData.get('isNewArrival') === 'on';
  const isBestSeller = formData.get('isBestSeller') === 'on';
  const isActive = formData.get('isActive') === 'on';
  const warrantyInfo = (formData.get('warrantyInfo') as string) || null;
  const categoryId = formData.get('categoryId') as string;
  const brandId = (formData.get('brandId') as string) || null;
  const imageUrl = (formData.get('imageUrl') as string)?.trim();

  // Validate payload
  const validation = productCreateSchema.safeParse({
    name,
    slug,
    sku,
    barcode,
    description,
    sellingPrice,
    compareAtPrice,
    costPrice,
    stock,
    lowStockThreshold,
    isFeatured,
    isActive,
    warrantyInfo,
    categoryId,
    brandId,
    images: imageUrl ? [{ url: imageUrl, isPrimary: true, sortOrder: 0 }] : [],
    specifications: [],
    variants: [],
  });

  if (!validation.success) {
    return {
      error: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  }

  try {
    // Check duplicate SKU or Slug
    const existing = await prisma.product.findFirst({
      where: { OR: [{ sku }, { slug }] },
    });

    if (existing) {
      if (existing.sku === sku) {
        return { error: `এই SKU (${sku}) ইতিমধ্যে ব্যবহৃত হয়েছে। ভিন্ন SKU দিন।` };
      }
      if (existing.slug === slug) {
        return { error: `এই স্লাগ (${slug}) ইতিমধ্যে ব্যবহৃত হয়েছে। ভিন্ন স্লাগ দিন।` };
      }
    }

    // Create product and initial inventory ledger entry in transaction
    const product = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          name,
          slug,
          sku,
          barcode,
          description,
          sellingPrice,
          compareAtPrice,
          costPrice,
          stock,
          lowStockThreshold,
          isFeatured,
          isNewArrival,
          isBestSeller,
          isActive,
          warrantyInfo,
          categoryId,
          brandId,
          images: imageUrl
            ? {
                create: [{ url: imageUrl, isPrimary: true, sortOrder: 0 }],
              }
            : undefined,
        },
      });

      if (stock > 0) {
        await tx.inventoryMovement.create({
          data: {
            productId: prod.id,
            type: InventoryMovementType.INITIAL,
            quantity: stock,
            previousStock: 0,
            newStock: stock,
            reason: 'পণ্য তৈরি ও প্রাথমিক স্টক অন্তর্ভুক্তি',
            createdByUserId: session.userId,
          },
        });
      }

      return prod;
    });

    // Audit log
    await recordAuditLog({
      userId: session.userId,
      action: 'PRODUCT_CREATE',
      entityType: 'Product',
      entityId: product.id,
      details: { name: product.name, sku: product.sku, price: sellingPrice, stock },
    });

    revalidatePath('/products');
    revalidatePath('/admin/products');
    return { success: true, productId: product.id };
  } catch (error: any) {
    console.error('Failed to create product:', error);
    return { error: error.message || 'পণ্য তৈরিতে ব্যর্থ হয়েছে।' };
  }
}

export async function toggleProductActiveAction(productId: string, currentState: boolean) {
  const session = await requireAuth();

  try {
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isActive: !currentState },
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'PRODUCT_TOGGLE_ACTIVE',
      entityType: 'Product',
      entityId: productId,
      details: { newState: updated.isActive },
    });

    revalidatePath('/products');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'স্ট্যাটাস পরিবর্তনে ত্রুটি হয়েছে।' };
  }
}
