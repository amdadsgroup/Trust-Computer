'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
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

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidateTag('products');
    revalidateTag('homepage');
    revalidateTag('category-counts');
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

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidateTag('products');
    revalidateTag('homepage');
    revalidateTag('category-counts');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'Failed to update product status.' };
  }
}

export async function toggleProductFeaturedAction(productId: string, currentState: boolean) {
  const session = await requireAuth();

  try {
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isFeatured: !currentState },
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'PRODUCT_TOGGLE_FEATURED',
      entityType: 'Product',
      entityId: productId,
      details: { newState: updated.isFeatured },
    });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidateTag('products');
    revalidateTag('homepage');
    return { success: true, isFeatured: updated.isFeatured };
  } catch (e: any) {
    return { error: e.message || 'Failed to update featured status.' };
  }
}

export async function updateProductAction(productId: string, formData: FormData) {
  const session = await requireAuth();

  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.toLowerCase().trim();
  const sku = (formData.get('sku') as string)?.trim();
  const barcode = (formData.get('barcode') as string)?.trim() || null;
  const description = (formData.get('description') as string)?.trim();
  const sellingPrice = parseFloat(formData.get('sellingPrice') as string);
  const compareAtPrice = formData.get('compareAtPrice')
    ? parseFloat(formData.get('compareAtPrice') as string)
    : null;
  const costPrice = formData.get('costPrice')
    ? parseFloat(formData.get('costPrice') as string)
    : null;
  const rawStock = formData.get('stock') as string;
  const stock = rawStock !== null && rawStock !== '' ? parseInt(rawStock, 10) : NaN;
  const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string, 10) || 3;
  const isFeatured = formData.get('isFeatured') === 'on';
  const isNewArrival = formData.get('isNewArrival') === 'on';
  const isBestSeller = formData.get('isBestSeller') === 'on';
  const isActive = formData.get('isActive') === 'on';
  const warrantyInfo = (formData.get('warrantyInfo') as string)?.trim() || null;
  const categoryId = formData.get('categoryId') as string;
  const brandId = (formData.get('brandId') as string)?.trim() || null;
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
    stock: isNaN(stock) ? 0 : Math.max(0, stock),
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
    const current = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!current) {
      return { error: 'Product not found.' };
    }

    // Check duplicate SKU or Slug with OTHER products
    const duplicate = await prisma.product.findFirst({
      where: {
        id: { not: productId },
        OR: [{ sku }, { slug }],
      },
    });

    if (duplicate) {
      if (duplicate.sku === sku) {
        return { error: `This SKU (${sku}) is already in use by another product.` };
      }
      if (duplicate.slug === slug) {
        return { error: `This URL slug (${slug}) is already in use by another product.` };
      }
    }

    // Ensure category exists in database
    const validatedCategoryId = await ensureCategoryExistsInDb(categoryId);

    // Validate optional brandId
    const validatedBrandId = await validateBrandId(brandId);

    // Resolve valid admin user ID
    const validUserId = await getValidAdminUserId(session.userId);

    const newStockVal = isNaN(stock) ? current.stock : Math.max(0, stock);

    await prisma.$transaction(async (tx) => {
      // Record stock change if stock changed
      if (newStockVal !== current.stock) {
        const diff = newStockVal - current.stock;
        await tx.inventoryMovement.create({
          data: {
            productId,
            type: InventoryMovementType.ADJUSTMENT,
            quantity: diff,
            previousStock: current.stock,
            newStock: newStockVal,
            reason: 'Stock updated via Product Edit form',
            createdByUserId: validUserId,
          },
        });
      }

      // Update primary image if provided
      if (imageUrl) {
        const primaryImg = current.images.find((img) => img.isPrimary) || current.images[0];
        if (primaryImg) {
          await tx.productImage.update({
            where: { id: primaryImg.id },
            data: { url: imageUrl },
          });
        } else {
          await tx.productImage.create({
            data: {
              productId,
              url: imageUrl,
              isPrimary: true,
              sortOrder: 0,
            },
          });
        }
      }

      // Update product record
      await tx.product.update({
        where: { id: productId },
        data: {
          name,
          slug,
          sku,
          barcode,
          description,
          sellingPrice,
          compareAtPrice,
          costPrice,
          stock: newStockVal,
          lowStockThreshold,
          isFeatured,
          isNewArrival,
          isBestSeller,
          isActive,
          warrantyInfo,
          categoryId: validatedCategoryId,
          brandId: validatedBrandId,
        },
      });
    });

    // Record audit log
    await recordAuditLog({
      userId: validUserId || undefined,
      action: 'PRODUCT_UPDATE',
      entityType: 'Product',
      entityId: productId,
      details: { name, sku, price: sellingPrice, stock: newStockVal },
    });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/products/${slug}`);
    if (current.slug !== slug) {
      revalidatePath(`/products/${current.slug}`);
    }
    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${productId}/edit`);
    revalidatePath('/admin');
    revalidatePath('/admin/inventory');
    revalidateTag('products');
    revalidateTag('homepage');
    revalidateTag('category-counts');

    return { success: true, productId };
  } catch (error: any) {
    console.error('Failed to update product:', error);
    return { error: error.message || 'Failed to update product.' };
  }
}

export async function deleteProductAction(productId: string) {
  const session = await requireAuth();

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, sku: true, slug: true },
    });

    if (!product) {
      return { error: 'Product not found.' };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Safely disconnect order items so past order records/totals remain intact
      await tx.orderItem.updateMany({
        where: { productId },
        data: { productId: null },
      });

      // 2. Disconnect promotional offers
      await tx.offer.updateMany({
        where: { productId },
        data: { productId: null },
      });

      // 3. Remove wishlist items
      await tx.wishlistItem.deleteMany({
        where: { productId },
      });

      // 4. Remove active stock reservations
      await tx.stockReservation.deleteMany({
        where: { productId },
      });

      // 5. Remove customer reviews & review images
      const reviews = await tx.review.findMany({
        where: { productId },
        select: { id: true },
      });
      if (reviews.length > 0) {
        await tx.reviewImage.deleteMany({
          where: { reviewId: { in: reviews.map((r) => r.id) } },
        });
        await tx.review.deleteMany({
          where: { productId },
        });
      }

      // 6. Delete specifications and variants
      await tx.productSpecification.deleteMany({ where: { productId } });
      await tx.productVariant.deleteMany({ where: { productId } });

      // 7. Delete inventory movements and images
      await tx.inventoryMovement.deleteMany({ where: { productId } });
      await tx.productImage.deleteMany({ where: { productId } });

      // 8. Delete product
      await tx.product.delete({ where: { id: productId } });
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'PRODUCT_DELETE',
      entityType: 'Product',
      entityId: productId,
      details: { name: product.name, sku: product.sku },
    });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/products/${product.slug}`);
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath('/admin/inventory');
    revalidateTag('products');
    revalidateTag('homepage');
    revalidateTag('category-counts');

    return { success: true };
  } catch (e: any) {
    console.error('Failed to delete product:', e);
    return { error: e.message || 'Failed to delete product.' };
  }
}

