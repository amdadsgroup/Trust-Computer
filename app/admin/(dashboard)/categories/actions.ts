'use server';

import { revalidateTag } from 'next/cache';
import prisma from '@/lib/db';
import { requireAuth, recordAuditLog } from '@/lib/auth';
import { categorySchema, brandSchema } from '@/lib/validations';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateEdgeTag } from '@/lib/cache-edge';

function slugify(text: string): string {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseTaxonomyInput(formData: FormData, fallbackPrefix: string) {
  const name = ((formData.get('name') as string) || '').trim();
  const rawSlug = ((formData.get('slug') as string) || '').trim();
  const description = ((formData.get('description') as string) || '').trim() || null;

  let slug = slugify(rawSlug);
  if (!slug || slug.length < 2) slug = slugify(name);
  if (!slug || slug.length < 2) slug = `${fallbackPrefix}-${Date.now().toString(36)}`;

  return { name, slug, description };
}

function revalidateCategoryCaches() {
  revalidateTag('categories');
  revalidateTag('homepage');
  revalidateTag('category-counts');
  revalidateEdgeTag('categories');
  revalidateEdgeTag('homepage');
  revalidateEdgeTag('category-counts');
}

export async function createCategoryAction(formData: FormData) {
  try {
    const session = await requireAuth();
    const { name, slug, description } = parseTaxonomyInput(formData, 'category');

    if (!name) {
      return { error: 'Category name is required.' };
    }

    const validation = categorySchema.safeParse({ name, slug, description });
    if (!validation.success) {
      return { error: validation.error.errors.map((e) => e.message).join(', ') };
    }

    let category: any = null;
    try {
      const existing = await prisma.category.findUnique({ where: { slug } });
      if (existing) {
        return { error: `The slug "${slug}" is already in use by another category.` };
      }

      category = await prisma.category.create({
        data: { name, slug, description, isActive: true },
      });
    } catch (prismaErr) {
      const sb = createAdminClient();
      if (!sb) throw prismaErr;

      const { data: existing } = await sb.from('categories').select('id').eq('slug', slug).maybeSingle();
      if (existing) {
        return { error: `The slug "${slug}" is already in use by another category.` };
      }

      const now = new Date().toISOString();
      const { data: created, error } = await sb
        .from('categories')
        .insert({
          id: crypto.randomUUID(),
          name,
          slug,
          description,
          sortOrder: 0,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();
      if (error || !created) throw new Error(error?.message || 'Failed to create category');
      category = created;
    }

    try {
      await recordAuditLog({
        userId: session.userId,
        action: 'CATEGORY_CREATE',
        entityType: 'Category',
        entityId: category.id,
        details: { name, slug },
      });
    } catch (_) {}

    revalidateCategoryCaches();
    return { success: true, category };
  } catch (e: any) {
    console.error('Error in createCategoryAction:', e);
    return { error: e.message || 'Failed to create category. Please check database connection.' };
  }
}

export async function createBrandAction(formData: FormData) {
  try {
    const session = await requireAuth();
    const { name, slug, description } = parseTaxonomyInput(formData, 'brand');

    if (!name) {
      return { error: 'Brand name is required.' };
    }

    const validation = brandSchema.safeParse({ name, slug, description });
    if (!validation.success) {
      return { error: validation.error.errors.map((e) => e.message).join(', ') };
    }

    let brand: any = null;
    try {
      const existing = await prisma.brand.findUnique({ where: { slug } });
      if (existing) {
        return { error: `The slug "${slug}" is already in use by another brand.` };
      }

      brand = await prisma.brand.create({
        data: { name, slug, description, isActive: true },
      });
    } catch (prismaErr) {
      const sb = createAdminClient();
      if (!sb) throw prismaErr;

      const { data: existing } = await sb.from('brands').select('id').eq('slug', slug).maybeSingle();
      if (existing) {
        return { error: `The slug "${slug}" is already in use by another brand.` };
      }

      const now = new Date().toISOString();
      const { data: created, error } = await sb
        .from('brands')
        .insert({
          id: crypto.randomUUID(),
          name,
          slug,
          description,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })
        .select()
        .single();
      if (error || !created) throw new Error(error?.message || 'Failed to create brand');
      brand = created;
    }

    try {
      await recordAuditLog({
        userId: session.userId,
        action: 'BRAND_CREATE',
        entityType: 'Brand',
        entityId: brand.id,
        details: { name, slug },
      });
    } catch (_) {}

    revalidateTag('categories');
    revalidateTag('brands');
    revalidateEdgeTag('categories');
    return { success: true, brand };
  } catch (e: any) {
    console.error('Error in createBrandAction:', e);
    return { error: e.message || 'Failed to create brand. Please check database connection.' };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    const session = await requireAuth();
    let catInfo: { name: string; slug: string } | null = null;

    try {
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
      catInfo = { name: category.name, slug: category.slug };
    } catch (prismaErr) {
      const sb = createAdminClient();
      if (!sb) throw prismaErr;

      const { data: category } = await sb
        .from('categories')
        .select('id, name, slug')
        .eq('id', categoryId)
        .maybeSingle();
      if (!category) return { error: 'Category not found.' };

      const { count } = await sb
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('categoryId', categoryId);
      if ((count ?? 0) > 0) {
        return {
          error: `Cannot delete: ${count} products are currently assigned to this category. Please reassign or remove them first.`,
        };
      }

      const { error } = await sb.from('categories').delete().eq('id', categoryId);
      if (error) throw new Error(error.message);
      catInfo = { name: category.name, slug: category.slug };
    }

    try {
      await recordAuditLog({
        userId: session.userId,
        action: 'CATEGORY_DELETE',
        entityType: 'Category',
        entityId: categoryId,
        details: catInfo,
      });
    } catch (_) {}

    revalidateCategoryCaches();
    return { success: true };
  } catch (e: any) {
    console.error('Error in deleteCategoryAction:', e);
    return { error: e.message || 'Failed to delete category.' };
  }
}

export async function deleteBrandAction(brandId: string) {
  try {
    const session = await requireAuth();
    let brandInfo: { name: string; slug: string } | null = null;

    try {
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
      brandInfo = { name: brand.name, slug: brand.slug };
    } catch (prismaErr) {
      const sb = createAdminClient();
      if (!sb) throw prismaErr;

      const { data: brand } = await sb
        .from('brands')
        .select('id, name, slug')
        .eq('id', brandId)
        .maybeSingle();
      if (!brand) return { error: 'Brand not found.' };

      const { count } = await sb
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('brandId', brandId);
      if ((count ?? 0) > 0) {
        return {
          error: `Cannot delete: ${count} products are currently assigned to this brand. Please reassign or remove them first.`,
        };
      }

      const { error } = await sb.from('brands').delete().eq('id', brandId);
      if (error) throw new Error(error.message);
      brandInfo = { name: brand.name, slug: brand.slug };
    }

    try {
      await recordAuditLog({
        userId: session.userId,
        action: 'BRAND_DELETE',
        entityType: 'Brand',
        entityId: brandId,
        details: brandInfo,
      });
    } catch (_) {}

    revalidateTag('categories');
    revalidateTag('brands');
    revalidateEdgeTag('categories');
    return { success: true };
  } catch (e: any) {
    console.error('Error in deleteBrandAction:', e);
    return { error: e.message || 'Failed to delete brand.' };
  }
}
