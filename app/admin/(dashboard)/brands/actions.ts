'use server';

import { revalidateTag } from 'next/cache';
import prisma from '@/lib/db';
import { requireAuth, recordAuditLog } from '@/lib/auth';
import { brandSchema } from '@/lib/validations';
import { createAdminClient } from '@/lib/supabase/admin';

function slugify(text: string): string {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createBrandAction(formData: FormData) {
  try {
    const session = await requireAuth();

    const name = ((formData.get('name') as string) || '').trim();
    let rawSlug = ((formData.get('slug') as string) || '').trim();
    const description = ((formData.get('description') as string) || '').trim() || null;
    const logo = ((formData.get('logo') as string) || '').trim() || null;

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

    const validation = brandSchema.safeParse({ name, slug, description, logo });
    if (!validation.success) {
      return { error: validation.error.errors.map((e) => e.message).join(', ') };
    }

    let brand: any = null;
    try {
      const existing = await prisma.brand.findUnique({ where: { slug } });
      if (existing) {
        return { error: `A brand with slug "${slug}" already exists.` };
      }
      brand = await prisma.brand.create({
        data: { name, slug, description, logo, isActive: true },
      });
    } catch {
      const sb = createAdminClient();
      if (!sb) throw new Error('Database service unavailable');
      const { data: existing } = await sb.from('brands').select('id').eq('slug', slug).maybeSingle();
      if (existing) {
        return { error: `A brand with slug "${slug}" already exists.` };
      }
      const { data: created, error } = await sb
        .from('brands')
        .insert({ name, slug, description, logo, isActive: true })
        .select()
        .single();
      if (error || !created) throw new Error(error?.message || 'Failed to insert brand');
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

    revalidateTag('brands');
    return { success: true, brand };
  } catch (e: any) {
    console.error('Error creating brand:', e);
    return { error: e.message || 'Failed to create brand. Please check database connectivity.' };
  }
}

export async function toggleBrandStatusAction(brandId: string) {
  try {
    const session = await requireAuth();

    let brandName = '';
    let newStatus = true;

    try {
      const current = await prisma.brand.findUnique({ where: { id: brandId } });
      if (!current) return { error: 'Brand not found.' };
      newStatus = !current.isActive;
      brandName = current.name;
      await prisma.brand.update({
        where: { id: brandId },
        data: { isActive: newStatus },
      });
    } catch {
      const sb = createAdminClient();
      if (!sb) throw new Error('Database service unavailable');
      const { data: current } = await sb.from('brands').select('name, isActive').eq('id', brandId).single();
      if (!current) return { error: 'Brand not found.' };
      newStatus = !current.isActive;
      brandName = current.name;
      await sb.from('brands').update({ isActive: newStatus, updatedAt: new Date().toISOString() }).eq('id', brandId);
    }

    try {
      await recordAuditLog({
        userId: session.userId,
        action: 'BRAND_STATUS_TOGGLE',
        entityType: 'Brand',
        entityId: brandId,
        details: { name: brandName, isActive: newStatus },
      });
    } catch (_) {}

    revalidateTag('brands');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'Failed to update brand status.' };
  }
}

export async function deleteBrandAction(brandId: string) {
  try {
    const session = await requireAuth();

    try {
      const productCount = await prisma.product.count({
        where: { brandId },
      });

      if (productCount > 0) {
        return {
          error: `Cannot delete this brand because ${productCount} products are assigned to it. Reassign or delete those products first.`,
        };
      }

      await prisma.brand.delete({
        where: { id: brandId },
      });
    } catch {
      const sb = createAdminClient();
      if (!sb) throw new Error('Database service unavailable');
      const { count } = await sb.from('products').select('id', { count: 'exact', head: true }).eq('brandId', brandId);
      if ((count ?? 0) > 0) {
        return {
          error: `Cannot delete this brand because ${count} products are assigned to it. Reassign or delete those products first.`,
        };
      }
      await sb.from('brands').delete().eq('id', brandId);
    }

    try {
      await recordAuditLog({
        userId: session.userId,
        action: 'BRAND_DELETE',
        entityType: 'Brand',
        entityId: brandId,
      });
    } catch (_) {}

    revalidateTag('brands');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'Failed to delete brand.' };
  }
}
