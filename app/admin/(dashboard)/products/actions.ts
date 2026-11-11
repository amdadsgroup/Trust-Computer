'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import prisma from '@/lib/db';
import { requireAuth, recordAuditLog, getValidAdminUserId } from '@/lib/auth';
import { productCreateSchema } from '@/lib/validations';
import { InventoryMovementType } from '@prisma/client';
import { ensureCategoryExistsInDb, validateBrandId } from '@/lib/categories';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateEdgeTag } from '@/lib/cache-edge';

function revalidateProductCaches() {
  revalidateTag('products');
  revalidateTag('homepage');
  revalidateTag('category-counts');
  revalidateEdgeTag('products');
  revalidateEdgeTag('homepage');
  revalidateEdgeTag('category-counts');
  revalidatePath('/admin/products');
  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath('/products');
}

function parseProductFormData(formData: FormData, isUpdate = false) {
  const name = ((formData.get('name') as string) || '').trim();
  const slug = ((formData.get('slug') as string) || '').toLowerCase().trim();
  const sku = ((formData.get('sku') as string) || '').trim();
  const barcode = ((formData.get('barcode') as string) || '').trim() || null;
  const description = ((formData.get('description') as string) || '').trim();
  const sellingPrice = parseFloat(formData.get('sellingPrice') as string);
  const compareAtPrice = formData.get('compareAtPrice')
    ? parseFloat(formData.get('compareAtPrice') as string)
    : null;
  const costPrice = formData.get('costPrice')
    ? parseFloat(formData.get('costPrice') as string)
    : null;
  const rawStock = formData.get('stock') as string;
  const parsedStock =
    rawStock !== null && rawStock !== '' ? parseInt(rawStock, 10) : isUpdate ? NaN : 0;
  const stock = isUpdate ? parsedStock : parsedStock || 0;
  const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string, 10) || 3;
  const isFeatured = formData.get('isFeatured') === 'on';
  const isNewArrival = formData.get('isNewArrival') === 'on';
  const isBestSeller = formData.get('isBestSeller') === 'on';
  const isActive = formData.get('isActive') === 'on';
  const warrantyInfo = ((formData.get('warrantyInfo') as string) || '').trim() || null;
  const categoryId = formData.get('categoryId') as string;
  const brandId = ((formData.get('brandId') as string) || '').trim() || null;
  const imageUrl = ((formData.get('imageUrl') as string) || '').trim();

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

  return {
    validation,
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
      imageUrl,
    },
  };
}

async function checkDuplicateSkuOrSlugSupabase(
  sb: NonNullable<ReturnType<typeof createAdminClient>>,
  sku: string,
  slug: string,
  excludeProductId?: string
): Promise<string | null> {
  let skuQuery = sb.from('products').select('id').eq('sku', sku);
  let slugQuery = sb.from('products').select('id').eq('slug', slug);

  if (excludeProductId) {
    skuQuery = skuQuery.neq('id', excludeProductId);
    slugQuery = slugQuery.neq('id', excludeProductId);
  }

  const [skuRes, slugRes] = await Promise.all([
    skuQuery.limit(1).maybeSingle(),
    slugQuery.limit(1).maybeSingle(),
  ]);

  if (skuRes.error) throw new Error(skuRes.error.message);
  if (slugRes.error) throw new Error(slugRes.error.message);

  const suffix = excludeProductId ? ' by another product.' : '. Please enter a unique SKU.';
  const slugSuffix = excludeProductId ? ' by another product.' : '. Please enter a unique slug.';

  if (skuRes.data) {
    return `This SKU (${sku}) is already in use${suffix}`;
  }
  if (slugRes.data) {
    return `This URL slug (${slug}) is already in use${slugSuffix}`;
  }
  return null;
}

export async function createProductAction(formData: FormData) {
  const session = await requireAuth();
  const { validation, data } = parseProductFormData(formData, false);

  if (!validation.success) {
    return {
      error: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  }

  const {
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
    imageUrl,
  } = data;

  try {
    let product: { id: string; name: string; sku: string } | null = null;
    let validUserId: string | null = null;

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

      const [validatedCategoryId, validatedBrandId, resolvedUserId] = await Promise.all([
        ensureCategoryExistsInDb(categoryId),
        validateBrandId(brandId),
        getValidAdminUserId(session.userId),
      ]);
      validUserId = resolvedUserId;

      product = await prisma.$transaction(async (tx) => {
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
    } catch (prismaErr) {
      // Tier 2: Supabase REST fallback for Cloudflare Workers
      const sb = createAdminClient();
      if (!sb) throw prismaErr;

      const duplicateError = await checkDuplicateSkuOrSlugSupabase(sb, sku, slug);
      if (duplicateError) {
        return { error: duplicateError };
      }

      const [validatedCategoryId, validatedBrandId, resolvedUserId] = await Promise.all([
        ensureCategoryExistsInDb(categoryId),
        validateBrandId(brandId),
        getValidAdminUserId(session.userId),
      ]);
      validUserId = resolvedUserId;

      const now = new Date().toISOString();
      const productId = crypto.randomUUID();

      const { data: createdProd, error: prodErr } = await sb
        .from('products')
        .insert({
          id: productId,
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
          createdAt: now,
          updatedAt: now,
        })
        .select('id, name, sku')
        .single();

      if (prodErr || !createdProd) {
        if (prodErr?.code === '23505') {
          return { error: `A product with SKU "${sku}" or slug "${slug}" already exists.` };
        }
        throw new Error(prodErr?.message || 'Failed to create product.');
      }

      if (imageUrl) {
        const { error: imgErr } = await sb.from('product_images').insert({
          id: crypto.randomUUID(),
          productId: createdProd.id,
          url: imageUrl,
          isPrimary: true,
          sortOrder: 0,
          createdAt: now,
        });
        if (imgErr) {
          await sb.from('products').delete().eq('id', createdProd.id);
          throw new Error(imgErr.message || 'Failed to save product image.');
        }
      }

      if (stock > 0) {
        await sb.from('inventory_movements').insert({
          id: crypto.randomUUID(),
          productId: createdProd.id,
          type: InventoryMovementType.INITIAL,
          quantity: stock,
          previousStock: 0,
          newStock: stock,
          reason: 'Initial stock on product creation',
          createdByUserId: validUserId,
          createdAt: now,
        });
      }

      product = createdProd;
    }

    await recordAuditLog({
      userId: validUserId || undefined,
      action: 'PRODUCT_CREATE',
      entityType: 'Product',
      entityId: product.id,
      details: { name: product.name, sku: product.sku, price: sellingPrice, stock },
    });

    revalidateProductCaches();
    return { success: true, productId: product.id };
  } catch (error: any) {
    console.error('Failed to create product:', error);
    return { error: error.message || 'Failed to create product.' };
  }
}

export async function toggleProductActiveAction(productId: string, currentState: boolean) {
  const session = await requireAuth();

  try {
    let newState = !currentState;
    try {
      const updated = await prisma.product.update({
        where: { id: productId },
        data: { isActive: newState },
      });
      newState = updated.isActive;
    } catch (prismaErr) {
      const sb = createAdminClient();
      if (!sb) throw prismaErr;
      const { data: updated, error } = await sb
        .from('products')
        .update({ isActive: newState, updatedAt: new Date().toISOString() })
        .eq('id', productId)
        .select('isActive')
        .single();
      if (error || !updated) throw new Error(error?.message || 'Failed to update product status.');
      newState = updated.isActive;
    }

    await recordAuditLog({
      userId: session.userId,
      action: 'PRODUCT_TOGGLE_ACTIVE',
      entityType: 'Product',
      entityId: productId,
      details: { newState },
    });

    revalidateProductCaches();
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'Failed to update product status.' };
  }
}

export async function toggleProductFeaturedAction(productId: string, currentState: boolean) {
  const session = await requireAuth();

  try {
    let isFeatured = !currentState;
    try {
      const updated = await prisma.product.update({
        where: { id: productId },
        data: { isFeatured },
      });
      isFeatured = updated.isFeatured;
    } catch (prismaErr) {
      const sb = createAdminClient();
      if (!sb) throw prismaErr;
      const { data: updated, error } = await sb
        .from('products')
        .update({ isFeatured, updatedAt: new Date().toISOString() })
        .eq('id', productId)
        .select('isFeatured')
        .single();
      if (error || !updated) throw new Error(error?.message || 'Failed to update featured status.');
      isFeatured = updated.isFeatured;
    }

    await recordAuditLog({
      userId: session.userId,
      action: 'PRODUCT_TOGGLE_FEATURED',
      entityType: 'Product',
      entityId: productId,
      details: { newState: isFeatured },
    });

    revalidateProductCaches();
    return { success: true, isFeatured };
  } catch (e: any) {
    return { error: e.message || 'Failed to update featured status.' };
  }
}

export async function updateProductAction(productId: string, formData: FormData) {
  const session = await requireAuth();
  const { validation, data } = parseProductFormData(formData, true);

  if (!validation.success) {
    return {
      error: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
    };
  }

  const {
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
    imageUrl,
  } = data;

  try {
    let validUserId: string | null = null;
    let newStockVal = 0;

    try {
      const current = await prisma.product.findUnique({
        where: { id: productId },
        include: { images: true },
      });

      if (!current) {
        return { error: 'Product not found.' };
      }

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

      const [validatedCategoryId, validatedBrandId, resolvedUserId] = await Promise.all([
        ensureCategoryExistsInDb(categoryId),
        validateBrandId(brandId),
        getValidAdminUserId(session.userId),
      ]);
      validUserId = resolvedUserId;
      newStockVal = isNaN(stock) ? current.stock : Math.max(0, stock);

      await prisma.$transaction(async (tx) => {
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
    } catch (prismaErr) {
      // Tier 2: Supabase REST fallback
      const sb = createAdminClient();
      if (!sb) throw prismaErr;

      const { data: current, error: fetchErr } = await sb
        .from('products')
        .select('id, stock, images:product_images(id, isPrimary)')
        .eq('id', productId)
        .maybeSingle();

      if (fetchErr) throw new Error(fetchErr.message);
      if (!current) {
        return { error: 'Product not found.' };
      }

      const duplicateError = await checkDuplicateSkuOrSlugSupabase(sb, sku, slug, productId);
      if (duplicateError) {
        return { error: duplicateError };
      }

      const [validatedCategoryId, validatedBrandId, resolvedUserId] = await Promise.all([
        ensureCategoryExistsInDb(categoryId),
        validateBrandId(brandId),
        getValidAdminUserId(session.userId),
      ]);
      validUserId = resolvedUserId;
      newStockVal = isNaN(stock) ? current.stock : Math.max(0, stock);
      const now = new Date().toISOString();

      const { error: updateErr } = await sb
        .from('products')
        .update({
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
          updatedAt: now,
        })
        .eq('id', productId);

      if (updateErr) throw new Error(updateErr.message);

      if (newStockVal !== current.stock) {
        const diff = newStockVal - current.stock;
        await sb.from('inventory_movements').insert({
          id: crypto.randomUUID(),
          productId,
          type: InventoryMovementType.ADJUSTMENT,
          quantity: diff,
          previousStock: current.stock,
          newStock: newStockVal,
          reason: 'Stock updated via Product Edit form',
          createdByUserId: validUserId,
          createdAt: now,
        });
      }

      if (imageUrl) {
        const images = Array.isArray(current.images) ? current.images : [];
        const primaryImg = images.find((img: any) => img.isPrimary) || images[0];
        if (primaryImg) {
          await sb.from('product_images').update({ url: imageUrl }).eq('id', primaryImg.id);
        } else {
          await sb.from('product_images').insert({
            id: crypto.randomUUID(),
            productId,
            url: imageUrl,
            isPrimary: true,
            sortOrder: 0,
            createdAt: now,
          });
        }
      }
    }

    await recordAuditLog({
      userId: validUserId || undefined,
      action: 'PRODUCT_UPDATE',
      entityType: 'Product',
      entityId: productId,
      details: { name, sku, price: sellingPrice, stock: newStockVal },
    });

    revalidateProductCaches();
    return { success: true, productId };
  } catch (error: any) {
    console.error('Failed to update product:', error);
    return { error: error.message || 'Failed to update product.' };
  }
}

export async function deleteProductAction(productId: string) {
  const session = await requireAuth();

  try {
    let productInfo: { id: string; name: string; sku: string; slug: string } | null = null;

    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, sku: true, slug: true },
      });

      if (!product) {
        return { error: 'Product not found.' };
      }

      await prisma.$transaction(async (tx) => {
        await tx.orderItem.updateMany({ where: { productId }, data: { productId: null } });
        await tx.offer.updateMany({ where: { productId }, data: { productId: null } });
        await tx.wishlistItem.deleteMany({ where: { productId } });
        await tx.stockReservation.deleteMany({ where: { productId } });

        const reviews = await tx.review.findMany({
          where: { productId },
          select: { id: true },
        });
        if (reviews.length > 0) {
          await tx.reviewImage.deleteMany({
            where: { reviewId: { in: reviews.map((r) => r.id) } },
          });
          await tx.review.deleteMany({ where: { productId } });
        }

        await tx.productSpecification.deleteMany({ where: { productId } });
        await tx.productVariant.deleteMany({ where: { productId } });
        await tx.inventoryMovement.deleteMany({ where: { productId } });
        await tx.productImage.deleteMany({ where: { productId } });
        await tx.product.delete({ where: { id: productId } });
      });

      productInfo = product;
    } catch (prismaErr) {
      // Tier 2: Supabase REST fallback
      const sb = createAdminClient();
      if (!sb) throw prismaErr;

      const { data: product, error: fetchErr } = await sb
        .from('products')
        .select('id, name, sku, slug')
        .eq('id', productId)
        .maybeSingle();

      if (fetchErr) throw new Error(fetchErr.message);
      if (!product) {
        return { error: 'Product not found.' };
      }

      await sb.from('order_items').update({ productId: null }).eq('productId', productId);
      await sb.from('offers').update({ productId: null }).eq('productId', productId);
      await sb.from('wishlist_items').delete().eq('productId', productId);
      await sb.from('stock_reservations').delete().eq('productId', productId);

      const { data: reviews } = await sb.from('reviews').select('id').eq('productId', productId);
      if (reviews && reviews.length > 0) {
        const reviewIds = reviews.map((r: any) => r.id);
        await sb.from('review_images').delete().in('reviewId', reviewIds);
        await sb.from('reviews').delete().eq('productId', productId);
      }

      await Promise.all([
        sb.from('product_specifications').delete().eq('productId', productId),
        sb.from('product_variants').delete().eq('productId', productId),
        sb.from('inventory_movements').delete().eq('productId', productId),
        sb.from('product_images').delete().eq('productId', productId),
      ]);

      const { error: delErr } = await sb.from('products').delete().eq('id', productId);
      if (delErr) throw new Error(delErr.message);

      productInfo = product;
    }

    await recordAuditLog({
      userId: session.userId,
      action: 'PRODUCT_DELETE',
      entityType: 'Product',
      entityId: productId,
      details: { name: productInfo.name, sku: productInfo.sku },
    });

    revalidateProductCaches();
    return { success: true };
  } catch (e: any) {
    console.error('Failed to delete product:', e);
    return { error: e.message || 'Failed to delete product.' };
  }
}
