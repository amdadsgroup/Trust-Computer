'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { requireAuth, recordAuditLog } from '@/lib/auth';
import { categorySchema, brandSchema } from '@/lib/validations';

function slugify(text: string): string {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createCategoryAction(formData: FormData) {
  try {
    const session = await requireAuth();

    const name = ((formData.get('name') as string) || '').trim();
    let rawSlug = ((formData.get('slug') as string) || '').trim();
    const description = ((formData.get('description') as string) || '').trim() || null;

    if (!name) {
      return { error: 'Category name is required.' };
    }

    let slug = slugify(rawSlug);
    if (!slug || slug.length < 2) {
      slug = slugify(name);
    }
    if (!slug || slug.length < 2) {
      slug = 'category-' + Date.now().toString(36);
    }

    const validation = categorySchema.safeParse({ name, slug, description });
    if (!validation.success) {
      return { error: validation.error.errors.map((e) => e.message).join(', ') };
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return { error: `The slug "${slug}" is already in use by another category.` };
    }

    const category = await prisma.category.create({
      data: { name, slug, description, isActive: true },
    });

    try {
      await recordAuditLog({
        userId: session.userId,
        action: 'CATEGORY_CREATE',
        entityType: 'Category',
        entityId: category.id,
        details: { name, slug },
      });
    } catch (_) {}

    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    revalidatePath('/');
    return { success: true, category };
  } catch (e: any) {
    console.error('Error in createCategoryAction:', e);
    return { error: e.message || 'Failed to create category. Please check database connection.' };
  }
}

export async function createBrandAction(formData: FormData) {
  try {
    const session = await requireAuth();

    const name = ((formData.get('name') as string) || '').trim();
    let rawSlug = ((formData.get('slug') as string) || '').trim();
    const description = ((formData.get('description') as string) || '').trim() || null;

    if (!name) {
      return { error: 'Brand name is required.' };
    }

    let slug = slugify(rawSlug);
    if (!slug || slug.length < 2) {
      slug = slugify(name);
    }
    if (!slug || slug.length < 2) {
      slug = 'brand-' + Date.now().toString(36);
    }

    const validation = brandSchema.safeParse({ name, slug, description });
    if (!validation.success) {
      return { error: validation.error.errors.map((e) => e.message).join(', ') };
    }

    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) {
      return { error: `The slug "${slug}" is already in use by another brand.` };
    }

    const brand = await prisma.brand.create({
      data: { name, slug, description, isActive: true },
    });

    try {
      await recordAuditLog({
        userId: session.userId,
        action: 'BRAND_CREATE',
        entityType: 'Brand',
        entityId: brand.id,
        details: { name, slug },
      });
    } catch (_) {}

    revalidatePath('/admin/categories');
    revalidatePath('/admin/brands');
    return { success: true, brand };
  } catch (e: any) {
    console.error('Error in createBrandAction:', e);
    return { error: e.message || 'Failed to create brand. Please check database connection.' };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    const session = await requireAuth();

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return { error: 'Category not found.' };
    }

    if (category._count.products > 0) {
      return {
        error: `Cannot delete: ${category._count.products} products are currently assigned to this category. Please reassign or remove them first.`,
      };
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    try {
      await recordAuditLog({
        userId: session.userId,
        action: 'CATEGORY_DELETE',
        entityType: 'Category',
        entityId: categoryId,
        details: { name: category.name, slug: category.slug },
      });
    } catch (_) {}

    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    return { success: true };
  } catch (e: any) {
    console.error('Error in deleteCategoryAction:', e);
    return { error: e.message || 'Failed to delete category.' };
  }
}

export async function deleteBrandAction(brandId: string) {
  try {
    const session = await requireAuth();

    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: { _count: { select: { products: true } } },
    });

    if (!brand) {
      return { error: 'Brand not found.' };
    }

    if (brand._count.products > 0) {
      return {
        error: `Cannot delete: ${brand._count.products} products are currently assigned to this brand. Please reassign or remove them first.`,
      };
    }

    await prisma.brand.delete({
      where: { id: brandId },
    });

    try {
      await recordAuditLog({
        userId: session.userId,
        action: 'BRAND_DELETE',
        entityType: 'Brand',
        entityId: brandId,
        details: { name: brand.name, slug: brand.slug },
      });
    } catch (_) {}

    revalidatePath('/admin/categories');
    revalidatePath('/admin/brands');
    return { success: true };
  } catch (e: any) {
    console.error('Error in deleteBrandAction:', e);
    return { error: e.message || 'Failed to delete brand.' };
  }
}
