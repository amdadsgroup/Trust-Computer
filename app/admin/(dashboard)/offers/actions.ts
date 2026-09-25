'use server';

import { requireRole, recordAuditLog } from '@/lib/auth';
import {
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferActive,
} from '@/lib/offers';
import { offerSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export async function createOfferAction(data: unknown) {
  try {
    const session = await requireRole(['OWNER', 'ADMIN']);
    const validated = offerSchema.parse(data);

    const offer = await createOffer(validated);

    await recordAuditLog({
      userId: session.userId,
      action: 'OFFER_CREATE',
      entityType: 'Offer',
      entityId: offer.id,
      details: { title: offer.title },
    });

    revalidatePath('/admin/offers');
    revalidatePath('/');
    return { success: true, offerId: offer.id };
  } catch (err: any) {
    if (err.errors && err.errors[0]) {
      return { success: false, error: err.errors[0].message };
    }
    return { success: false, error: err.message || 'Failed to create offer' };
  }
}

export async function updateOfferAction(id: string, data: unknown) {
  try {
    const session = await requireRole(['OWNER', 'ADMIN']);
    const validated = offerSchema.parse(data);

    const offer = await updateOffer(id, validated);

    await recordAuditLog({
      userId: session.userId,
      action: 'OFFER_UPDATE',
      entityType: 'Offer',
      entityId: offer.id,
      details: { title: offer.title },
    });

    revalidatePath('/admin/offers');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    if (err.errors && err.errors[0]) {
      return { success: false, error: err.errors[0].message };
    }
    return { success: false, error: err.message || 'Failed to update offer' };
  }
}

export async function deleteOfferAction(id: string) {
  try {
    const session = await requireRole(['OWNER', 'ADMIN']);
    await deleteOffer(id);

    await recordAuditLog({
      userId: session.userId,
      action: 'OFFER_DELETE',
      entityType: 'Offer',
      entityId: id,
    });

    revalidatePath('/admin/offers');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete offer' };
  }
}

export async function toggleOfferActiveAction(id: string, isActive: boolean) {
  try {
    const session = await requireRole(['OWNER', 'ADMIN']);
    await toggleOfferActive(id, isActive);

    await recordAuditLog({
      userId: session.userId,
      action: 'OFFER_TOGGLE_ACTIVE',
      entityType: 'Offer',
      entityId: id,
      details: { isActive },
    });

    revalidatePath('/admin/offers');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update offer status' };
  }
}
