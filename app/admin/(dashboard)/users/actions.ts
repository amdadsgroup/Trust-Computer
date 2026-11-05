'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { requireRole, recordAuditLog } from '@/lib/auth';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const userCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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
    return { error: 'Only existing Owners can create another Owner account.' };
  }

  try {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    let newUser: any = null;

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return { error: 'An account with this email address already exists.' };
      }

      newUser = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
          phone,
          isActive: true,
        },
      });
    } catch {
      const sb = createAdminClient();
      if (!sb) throw new Error('Database service unavailable');
      const { data: existing } = await sb.from('users').select('id').eq('email', email).maybeSingle();
      if (existing) {
        return { error: 'An account with this email address already exists.' };
      }
      const { data: created, error } = await sb
        .from('users')
        .insert({
          name,
          email,
          passwordHash,
          role,
          phone,
          isActive: true,
        })
        .select()
        .single();
      if (error || !created) throw new Error(error?.message || 'Failed to create user');
      newUser = created;
    }

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
    return { error: err.message || 'Failed to create staff account.' };
  }
}

export async function toggleUserStatusAction(targetUserId: string) {
  const session = await requireRole(['OWNER', 'ADMIN']);

  if (targetUserId === session.userId) {
    return { error: 'You cannot deactivate your own account.' };
  }

  try {
    let email = '';
    let newStatus = true;

    try {
      const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!targetUser) return { error: 'User not found.' };

      if (targetUser.role === 'OWNER' && session.role !== 'OWNER') {
        return { error: 'You do not have permission to modify an Owner account.' };
      }

      newStatus = !targetUser.isActive;
      email = targetUser.email;
      await prisma.user.update({
        where: { id: targetUserId },
        data: { isActive: newStatus },
      });
    } catch {
      const sb = createAdminClient();
      if (!sb) throw new Error('Database service unavailable');
      const { data: targetUser } = await sb.from('users').select('email, role, isActive').eq('id', targetUserId).single();
      if (!targetUser) return { error: 'User not found.' };

      if (targetUser.role === 'OWNER' && session.role !== 'OWNER') {
        return { error: 'You do not have permission to modify an Owner account.' };
      }

      newStatus = !targetUser.isActive;
      email = targetUser.email;
      await sb.from('users').update({ isActive: newStatus, updatedAt: new Date().toISOString() }).eq('id', targetUserId);
    }

    await recordAuditLog({
      userId: session.userId,
      action: 'USER_STATUS_TOGGLE',
      entityType: 'User',
      entityId: targetUserId,
      details: { email, isActive: newStatus },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update user status.' };
  }
}

export async function updateUserRoleAction(targetUserId: string, newRole: 'OWNER' | 'ADMIN' | 'STAFF') {
  const session = await requireRole(['OWNER']);

  try {
    let email = '';
    let oldRole = '';

    try {
      const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!targetUser) return { error: 'User not found.' };
      email = targetUser.email;
      oldRole = targetUser.role;

      await prisma.user.update({
        where: { id: targetUserId },
        data: { role: newRole },
      });
    } catch {
      const sb = createAdminClient();
      if (!sb) throw new Error('Database service unavailable');
      const { data: targetUser } = await sb.from('users').select('email, role').eq('id', targetUserId).single();
      if (!targetUser) return { error: 'User not found.' };
      email = targetUser.email;
      oldRole = targetUser.role;

      await sb.from('users').update({ role: newRole, updatedAt: new Date().toISOString() }).eq('id', targetUserId);
    }

    await recordAuditLog({
      userId: session.userId,
      action: 'USER_ROLE_UPDATE',
      entityType: 'User',
      entityId: targetUserId,
      details: { email, oldRole, newRole },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update user role.' };
  }
}
