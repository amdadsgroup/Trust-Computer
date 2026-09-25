'use server';

import { requireRole, recordAuditLog } from '@/lib/auth';
import {
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerActive,
  reorderBanners,
} from '@/lib/banners';
import { bannerSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function createBannerAction(data: unknown) {
  try {
    const session = await requireRole(['OWNER', 'ADMIN']);
    const validated = bannerSchema.parse(data);

    const banner = await createBanner(validated);

    await recordAuditLog({
      userId: session.userId,
      action: 'BANNER_CREATE',
      entityType: 'Banner',
      entityId: banner.id,
      details: { title: banner.title, type: banner.type },
    });

    revalidatePath('/admin/banners');
    revalidatePath('/');
    return { success: true, bannerId: banner.id };
  } catch (err: any) {
    if (err.errors && err.errors[0]) {
      return { success: false, error: err.errors[0].message };
    }
    return { success: false, error: err.message || 'Failed to create banner' };
  }
}

export async function updateBannerAction(id: string, data: unknown) {
  try {
    const session = await requireRole(['OWNER', 'ADMIN']);
    const validated = bannerSchema.parse(data);

    const banner = await updateBanner(id, validated);

    await recordAuditLog({
      userId: session.userId,
      action: 'BANNER_UPDATE',
      entityType: 'Banner',
      entityId: banner.id,
      details: { title: banner.title },
    });

    revalidatePath('/admin/banners');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    if (err.errors && err.errors[0]) {
      return { success: false, error: err.errors[0].message };
    }
    return { success: false, error: err.message || 'Failed to update banner' };
  }
}

export async function deleteBannerAction(id: string) {
  try {
    const session = await requireRole(['OWNER', 'ADMIN']);
    await deleteBanner(id);

    await recordAuditLog({
      userId: session.userId,
      action: 'BANNER_DELETE',
      entityType: 'Banner',
      entityId: id,
    });

    revalidatePath('/admin/banners');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete banner' };
  }
}

export async function toggleBannerActiveAction(id: string, isActive: boolean) {
  try {
    const session = await requireRole(['OWNER', 'ADMIN']);
    await toggleBannerActive(id, isActive);

    await recordAuditLog({
      userId: session.userId,
      action: 'BANNER_TOGGLE_ACTIVE',
      entityType: 'Banner',
      entityId: id,
      details: { isActive },
    });

    revalidatePath('/admin/banners');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update status' };
  }
}

export async function reorderBannersAction(bannerIds: string[]) {
  try {
    const session = await requireRole(['OWNER', 'ADMIN']);
    await reorderBanners(bannerIds);

    await recordAuditLog({
      userId: session.userId,
      action: 'BANNER_REORDER',
      entityType: 'Banner',
      details: { count: bannerIds.length },
    });

    revalidatePath('/admin/banners');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reorder banners' };
  }
}
