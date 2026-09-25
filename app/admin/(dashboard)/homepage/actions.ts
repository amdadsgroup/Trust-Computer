'use server';

import { requireRole, recordAuditLog } from '@/lib/auth';
import { updateHomepageSection, reorderHomepageSections } from '@/lib/homepage';
import { revalidatePath } from 'next/cache';

export async function updateHomepageSectionAction(
  sectionKey: string,
  data: { isVisible?: boolean; sortOrder?: number; title?: string; subtitle?: string }
) {
  try {
    const session = await requireRole(['OWNER', 'ADMIN']);
    await updateHomepageSection(sectionKey, data);

    await recordAuditLog({
      userId: session.userId,
      action: 'HOMEPAGE_SECTION_UPDATE',
      entityType: 'HomepageSection',
      details: { sectionKey, data },
    });

    revalidatePath('/admin/homepage');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update section' };
  }
}

export async function reorderHomepageSectionsAction(sectionKeys: string[]) {
  try {
    const session = await requireRole(['OWNER', 'ADMIN']);
    await reorderHomepageSections(sectionKeys);

    await recordAuditLog({
      userId: session.userId,
      action: 'HOMEPAGE_SECTIONS_REORDER',
      entityType: 'HomepageSection',
      details: { sectionKeys },
    });

    revalidatePath('/admin/homepage');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to reorder sections' };
  }
}
