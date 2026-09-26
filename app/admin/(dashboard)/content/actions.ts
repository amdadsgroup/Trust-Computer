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
    return { error: 'Policy slug, title, and content are required.' };
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
    return { error: err.message || 'Failed to save policy content.' };
  }
}
