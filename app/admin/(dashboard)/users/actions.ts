'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { requireRole, recordAuditLog } from '@/lib/auth';
import { z } from 'zod';

const userCreateSchema = z.object({
  name: z.string().min(2, 'নাম অন্তত ২ অক্ষরের হতে হবে'),
  email: z.string().email('সঠিক ইমেইল ঠিকানা দিন'),
  password: z.string().min(8, 'পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে'),
  role: z.enum(['OWNER', 'ADMIN', 'STAFF']),
  phone: z.string().optional(),
});

export async function createUserAction(formData: FormData) {
  const session = await requireRole(['OWNER', 'ADMIN']);

  const name = formData.get('name') as string;
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const password = formData.get('password') as string;
  const role = formData.get('role') as 'OWNER' | 'ADMIN' | 'STAFF';
  const phone = (formData.get('phone') as string) || null;

  const validation = userCreateSchema.safeParse({ name, email, password, role, phone: phone || undefined });
  if (!validation.success) {
    return { error: validation.error.errors.map((e) => e.message).join(', ') };
  }

  // Only OWNER can create other OWNER accounts
  if (role === 'OWNER' && session.role !== 'OWNER') {
    return { error: 'শুধুমাত্র বর্তমান ওনার নতুন ওনার অ্যাকাউন্ট তৈরি করতে পারেন।' };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: 'এই ইমেইল ঠিকানা দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে।' };
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        phone,
        isActive: true,
      },
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'USER_CREATE',
      entityType: 'User',
      entityId: newUser.id,
      details: { name, email, role },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'স্টাফ অ্যাকাউন্ট তৈরিতে ত্রুটি হয়েছে।' };
  }
}

export async function toggleUserStatusAction(targetUserId: string) {
  const session = await requireRole(['OWNER', 'ADMIN']);

  if (targetUserId === session.userId) {
    return { error: 'আপনি নিজের অ্যাকাউন্ট নিষ্ক্রিয় করতে পারবেন না।' };
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) return { error: 'ব্যবহারকারী পাওয়া যায়নি।' };

    // Prevent non-owners from toggling owners
    if (targetUser.role === 'OWNER' && session.role !== 'OWNER') {
      return { error: 'ওনার অ্যাকাউন্ট পরিবর্তনের অনুমতি আপনার নেই।' };
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: !targetUser.isActive },
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'USER_STATUS_TOGGLE',
      entityType: 'User',
      entityId: targetUserId,
      details: { email: targetUser.email, isActive: updated.isActive },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে।' };
  }
}

export async function updateUserRoleAction(targetUserId: string, newRole: 'OWNER' | 'ADMIN' | 'STAFF') {
  const session = await requireRole(['OWNER']);

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) return { error: 'ব্যবহারকারী পাওয়া যায়নি।' };

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    await recordAuditLog({
      userId: session.userId,
      action: 'USER_ROLE_UPDATE',
      entityType: 'User',
      entityId: targetUserId,
      details: { email: targetUser.email, oldRole: targetUser.role, newRole },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'রোল পরিবর্তনে সমস্যা হয়েছে।' };
  }
}
