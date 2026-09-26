'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { requireAuth, recordAuditLog } from '@/lib/auth';
import { brandSchema } from '@/lib/validations';

export async function createBrandAction(formData: FormData) {
  const session = await requireAuth();

  const name = formData.get('name') as string;
  const slug = (formData.get('slug') as string)?.toLowerCase().trim();
  const description = (formData.get('description') as string) || null;
  const logo = (formData.get('logo') as string) || null;

  const validation = brandSchema.safeParse({ name, slug, description, logo });
  if (!validation.success) {
    return { error: validation.error.errors.map((e) => e.message).join(', ') };
  }

  try {
    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) {
      return { error: 'এই স্লাগ দিয়ে ইতিমধ্যে একটি ব্র্যান্ড রয়েছে।' };
    }

    const brand = await prisma.brand.create({
      data: { name, slug, description, logo },
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'BRAND_CREATE',
      entityType: 'Brand',
      entityId: brand.id,
      details: { name, slug },
    });

    revalidatePath('/admin/brands');
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'ব্র্যান্ড তৈরিতে ব্যর্থ হয়েছে।' };
  }
}

export async function toggleBrandStatusAction(brandId: string) {
  const session = await requireAuth();

  try {
    const current = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!current) return { error: 'ব্র্যান্ড পাওয়া যায়নি।' };

    const updated = await prisma.brand.update({
      where: { id: brandId },
      data: { isActive: !current.isActive },
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'BRAND_STATUS_TOGGLE',
      entityType: 'Brand',
      entityId: brandId,
      details: { name: current.name, isActive: updated.isActive },
    });

    revalidatePath('/admin/brands');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে।' };
  }
}

export async function deleteBrandAction(brandId: string) {
  const session = await requireAuth();

  try {
    const productCount = await prisma.product.count({
      where: { brandId },
    });

    if (productCount > 0) {
      return {
        error: `এই ব্র্যান্ডের অধীনে ${productCount}টি পণ্য রয়েছে। পণ্যগুলো অন্য ব্র্যান্ডে স্থানান্তর না করে এটি ডিলিট করা সম্ভব নয়।`,
      };
    }

    const deleted = await prisma.brand.delete({
      where: { id: brandId },
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'BRAND_DELETE',
      entityType: 'Brand',
      entityId: brandId,
      details: { name: deleted.name },
    });

    revalidatePath('/admin/brands');
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'ব্র্যান্ড অপসারণ করা যায়নি।' };
  }
}
