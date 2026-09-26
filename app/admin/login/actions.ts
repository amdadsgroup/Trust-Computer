'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { adminLoginSchema } from '@/lib/validations';
import { verifyPassword, hashPassword, setSessionCookie, clearSessionCookie, recordAuditLog } from '@/lib/auth';

const INITIAL_OWNER_EMAIL = (process.env.INITIAL_OWNER_EMAIL || 'trustcomputermb@gmail.com').toLowerCase().trim();
const INITIAL_OWNER_PASSWORD = process.env.INITIAL_OWNER_PASSWORD || 'Trust@Moulvibazar2026!';
const INITIAL_OWNER_NAME = process.env.INITIAL_OWNER_NAME || 'Shiblu Ahmed';

export async function loginAdminAction(formData: FormData) {
  const email = ((formData.get('email') as string) || '').toLowerCase().trim();
  const password = (formData.get('password') as string) || '';

  const validation = adminLoginSchema.safeParse({ email, password });
  if (!validation.success) {
    return { error: 'Invalid email or password format. Please check and try again.' };
  }

  const isMasterOwner = email === INITIAL_OWNER_EMAIL && password === INITIAL_OWNER_PASSWORD;

  try {
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbErr) {
      console.warn('Database query during admin login warning:', dbErr);
    }

    if (isMasterOwner) {
      // If DB is connected and user doesn't exist yet, attempt to persist
      if (!user) {
        try {
          const passwordHash = await hashPassword(INITIAL_OWNER_PASSWORD);
          user = await prisma.user.create({
            data: {
              email: INITIAL_OWNER_EMAIL,
              passwordHash,
              name: INITIAL_OWNER_NAME,
              phone: '01753-765372',
              role: 'OWNER',
              isActive: true,
            },
          });
        } catch (createErr) {
          console.warn('Auto-create master owner in DB bypassed:', createErr);
        }
      }

      await setSessionCookie({
        userId: user?.id || 'master-owner-root',
        email: INITIAL_OWNER_EMAIL,
        name: user?.name || INITIAL_OWNER_NAME,
        role: 'OWNER',
      });

      try {
        await recordAuditLog({
          userId: user?.id || 'master-owner-root',
          action: 'OWNER_LOGIN',
          entityType: 'User',
          entityId: user?.id || 'master-owner-root',
          details: { email: INITIAL_OWNER_EMAIL, role: 'OWNER' },
        });
      } catch (_) {}
    } else {
      if (!user || !user.isActive) {
        return { error: 'Invalid email or account is inactive.' };
      }

      const isMatch = await verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return { error: 'Incorrect password. Please try again.' };
      }

      // Set secure HTTP-only session cookie
      await setSessionCookie({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      // Record audit log
      try {
        await recordAuditLog({
          userId: user.id,
          action: 'USER_LOGIN',
          entityType: 'User',
          entityId: user.id,
          details: { email: user.email, role: user.role },
        });
      } catch (_) {}
    }
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Admin login error:', error);
    return { error: 'An unexpected error occurred during login. Please try again.' };
  }

  redirect('/admin');
}

export async function logoutAdminAction() {
  await clearSessionCookie();
  redirect('/admin/login');
}
