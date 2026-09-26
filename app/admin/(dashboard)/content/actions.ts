'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { updateContentPage } from '@/lib/content';

export async function savePolicyContentAction(formData: FormData) {
  const session = await requireRole(['OWNER', 'ADMIN']);

  const slug = formData.get('slug') as string;
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const isDraft = formData.get('isDraft') === 'true' || formData.get('isDraft') === 'on';

  if (!slug || !title || !content) {
    return { error: 'পলিসি স্লাগ, শিরোনাম ও কন্টেন্ট পূরণ করা আবশ্যক।' };
  }

  try {
    await updateContentPage(
      slug,
      {
        title,
        content,
        isDraft,
      },
      session.userId
    );

    revalidatePath(`/policies/${slug}`);
    revalidatePath('/admin/content');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'পলিসি সংরক্ষণে সমস্যা হয়েছে।' };
  }
}
