'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { requireAuth, recordAuditLog } from '@/lib/auth';

export async function updateStoreSettingsAction(formData: FormData) {
  const session = await requireAuth();

  const storeName = formData.get('storeName') as string;
  const ownerName = formData.get('ownerName') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const address = formData.get('address') as string;
  const facebookUrl = formData.get('facebookUrl') as string;
  const whatsappNumber = formData.get('whatsappNumber') as string;
  const deliveryFeeInside = parseFloat(formData.get('deliveryFeeInsideMoulvibazar') as string);
  const deliveryFeeOutside = parseFloat(formData.get('deliveryFeeOutsideMoulvibazar') as string);

  try {
    const updated = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        storeName,
        ownerName,
        phone,
        email,
        address,
        facebookUrl,
        whatsappNumber,
        deliveryFeeInsideMoulvibazar: deliveryFeeInside,
        deliveryFeeOutsideMoulvibazar: deliveryFeeOutside,
      },
      create: {
        id: 'default',
        storeName,
        ownerName,
        phone,
        email,
        address,
        facebookUrl,
        whatsappNumber,
        deliveryFeeInsideMoulvibazar: deliveryFeeInside,
        deliveryFeeOutsideMoulvibazar: deliveryFeeOutside,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'SETTINGS_UPDATE',
      entityType: 'SiteSettings',
      entityId: updated.id,
      details: { storeName, phone, deliveryFeeInside, deliveryFeeOutside },
    });

    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/about');
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update settings:', error);
    return { error: error.message || 'সেটিংস আপডেট ব্যর্থ হয়েছে।' };
  }
}
