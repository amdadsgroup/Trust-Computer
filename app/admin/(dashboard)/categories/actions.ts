'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { requireAuth, recordAuditLog } from '@/lib/auth';
import { categorySchema, brandSchema } from '@/lib/validations';

export async function createCategoryAction(formData: FormData) {
  const session = await requireAuth();

  const name = formData.get('name') as string;
  const slug = (formData.get('slug') as string)?.toLowerCase().trim();
  const description = (formData.get('description') as string) || null;

  const validation = categorySchema.safeParse({ name, slug, description });
  if (!validation.success) {
    return { error: validation.error.errors.map((e) => e.message).join(', ') };
  }

  try {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return { error: 'এই স্লাগ দিয়ে ইতিমধ্যে একটি ক্যাটাগরি রয়েছে।' };
    }

    const category = await prisma.category.create({
      data: { name, slug, description },
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'CATEGORY_CREATE',
      entityType: 'Category',
      entityId: category.id,
      details: { name, slug },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/categories');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'ক্যাটাগরি তৈরিতে ব্যর্থ হয়েছে।' };
  }
}

export async function createBrandAction(formData: FormData) {
  const session = await requireAuth();

  const name = formData.get('name') as string;
  const slug = (formData.get('slug') as string)?.toLowerCase().trim();
  const description = (formData.get('description') as string) || null;

  const validation = brandSchema.safeParse({ name, slug, description });
  if (!validation.success) {
    return { error: validation.error.errors.map((e) => e.message).join(', ') };
  }

  try {
    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) {
      return { error: 'এই স্লাগ দিয়ে ইতিমধ্যে একটি ব্র্যান্ড রয়েছে।' };
    }

    const brand = await prisma.brand.create({
      data: { name, slug, description },
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'BRAND_CREATE',
      entityType: 'Brand',
      entityId: brand.id,
      details: { name, slug },
    });

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || 'ব্র্যান্ড তৈরিতে ব্যর্থ হয়েছে।' };
  }
}
