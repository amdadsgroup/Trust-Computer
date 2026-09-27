'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { requireAuth, recordAuditLog, getValidAdminUserId } from '@/lib/auth';
import { productCreateSchema } from '@/lib/validations';
import { adjustInventory } from '@/lib/inventory';
import { InventoryMovementType } from '@prisma/client';
import { ensureCategoryExistsInDb, validateBrandId } from '@/lib/categories';

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
        return { error: `This SKU (${sku}) is already in use. Please enter a unique SKU.` };
      }
      if (existing.slug === slug) {
        return { error: `This URL slug (${slug}) is already in use. Please enter a unique slug.` };
      }
    }

    // Ensure category exists in database to avoid foreign key failure
    const validatedCategoryId = await ensureCategoryExistsInDb(categoryId);

    // Validate optional brandId to avoid foreign key failure
    const validatedBrandId = await validateBrandId(brandId);

    // Resolve valid admin user ID to avoid foreign key failure on InventoryMovement
    const validUserId = await getValidAdminUserId(session.userId);

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
          categoryId: validatedCategoryId,
          brandId: validatedBrandId,
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
            reason: 'Initial stock on product creation',
            createdByUserId: validUserId,
          },
        });
      }

      return prod;
    });

    // Audit log
    await recordAuditLog({
      userId: validUserId || undefined,
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
    return { error: error.message || 'Failed to create product.' };
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
    return { error: e.message || 'Failed to update product status.' };
  }
}

export async function deleteProductAction(productId: string) {
  const session = await requireAuth();

  try {
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId },
    });

    if (orderItemsCount > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: false },
      });

      await recordAuditLog({
        userId: session.userId,
        action: 'PRODUCT_ARCHIVE',
        entityType: 'Product',
        entityId: productId,
        details: { reason: 'Product has order items; archived instead of deleted' },
      });

      revalidatePath('/products');
      revalidatePath('/admin/products');
      return { success: true, message: 'Product archived because it has associated customer orders.' };
    }

    await prisma.inventoryMovement.deleteMany({ where: { productId } });
    await prisma.productImage.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });

    await recordAuditLog({
      userId: session.userId,
      action: 'PRODUCT_DELETE',
      entityType: 'Product',
      entityId: productId,
      details: {},
    });

    revalidatePath('/products');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'Failed to delete product.' };
  }
}

