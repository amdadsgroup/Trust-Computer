'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import prisma from '@/lib/db';
import { requireAuth, recordAuditLog } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateEdgeTag } from '@/lib/cache-edge';

export async function updateStoreSettingsAction(formData: FormData) {
  const session = await requireAuth();

  const storeName = (formData.get('storeName') as string)?.trim() || 'Trust Computer-Moulvibazar';
  const ownerName = (formData.get('ownerName') as string)?.trim() || 'Shiblu Ahmed';
  const phone = (formData.get('phone') as string)?.trim() || '01797854836';
  const email = (formData.get('email') as string)?.trim() || 'trustcomputermb@gmail.com';
  const address = (formData.get('address') as string)?.trim() || 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar, Bangladesh';
  const facebookUrl = (formData.get('facebookUrl') as string)?.trim() || 'https://www.facebook.com/TrustComputerr/';
  const whatsappNumber = (formData.get('whatsappNumber') as string)?.trim() || '+8801797854836';
  const servicePhone = (formData.get('servicePhone') as string)?.trim() || '01608346407';
  const serviceWhatsapp = (formData.get('serviceWhatsapp') as string)?.trim() || '+8801608346407';
  const bkashNumber = (formData.get('bkashNumber') as string)?.trim() || '01712556225';
  const deliveryFeeInside = parseFloat((formData.get('deliveryFeeInsideMoulvibazar') as string) || '60');
  const deliveryFeeOutside = parseFloat((formData.get('deliveryFeeOutsideMoulvibazar') as string) || '120');

  const payload = {
    storeName,
    ownerName,
    phone,
    email,
    address,
    facebookUrl,
    whatsappNumber,
    servicePhone,
    serviceWhatsapp,
    bkashNumber,
    deliveryFeeInsideMoulvibazar: deliveryFeeInside,
    deliveryFeeOutsideMoulvibazar: deliveryFeeOutside,
  };

  try {
    let settingsId = 'default';
    try {
      const updated = await prisma.siteSettings.upsert({
        where: { id: 'default' },
        update: payload,
        create: { id: 'default', ...payload },
      });
      settingsId = updated.id;
    } catch (prismaErr) {
      const sb = createAdminClient();
      if (!sb) throw prismaErr;
      const { data: updated, error } = await sb
        .from('site_settings')
        .upsert(
          {
            id: 'default',
            ...payload,
            updatedAt: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select('id')
        .single();
      if (error || !updated) throw new Error(error?.message || 'Failed to update settings.');
      settingsId = updated.id;
    }

    await recordAuditLog({
      userId: session.userId,
      action: 'SETTINGS_UPDATE',
      entityType: 'SiteSettings',
      entityId: settingsId,
      details: {
        storeName,
        salesPhone: phone,
        servicePhone,
        bkashNumber,
        deliveryFeeInside,
        deliveryFeeOutside,
      },
    });

    revalidateTag('settings');
    revalidateEdgeTag('settings');
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update settings:', error);
    return { error: error.message || 'Failed to update settings.' };
  }
}
