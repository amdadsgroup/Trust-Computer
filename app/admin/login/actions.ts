'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { adminLoginSchema } from '@/lib/validations';
import { verifyPassword, hashPassword, setSessionCookie, clearSessionCookie, recordAuditLog, getValidAdminUserId } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

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
    let user: any = null;
    try {
      user = await prisma.user.findUnique({ where: { email } });
    } catch {
      try {
        const sb = createAdminClient();
        if (sb) {
          const { data } = await sb.from('users').select('*').eq('email', email).maybeSingle();
          user = data;
        }
      } catch {}
    }


    if (isMasterOwner) {
      if (!user) {
        try {
          user = await prisma.user.findFirst({ where: { role: 'OWNER' } });
        } catch {
          try {
            const sb = createAdminClient();
            if (sb) {
              const { data } = await sb.from('users').select('*').eq('role', 'OWNER').limit(1).maybeSingle();
              user = data;
            }
          } catch {}
        }

        if (!user) {
          const passwordHash = await hashPassword(INITIAL_OWNER_PASSWORD);
          try {
            user = await prisma.user.create({
              data: {
                email: INITIAL_OWNER_EMAIL,
                passwordHash,
                name: INITIAL_OWNER_NAME,
                phone: '01797854836',
                role: 'OWNER',
                isActive: true,
              },
            });
          } catch {
            try {
              const sb = createAdminClient();
              if (sb) {
                const now = new Date().toISOString();
                const { data } = await sb
                  .from('users')
                  .insert({
                    id: crypto.randomUUID(),
                    email: INITIAL_OWNER_EMAIL,
                    passwordHash,
                    name: INITIAL_OWNER_NAME,
                    phone: '01797854836',
                    role: 'OWNER',
                    isActive: true,
                    createdAt: now,
                    updatedAt: now,
                  })
                  .select()
                  .single();
                user = data;
              }
            } catch {}
          }
        }
      }

      const validId = user?.id || (await getValidAdminUserId('master-owner-root')) || 'master-owner-root';

      // Set session with valid DB UUID
      await setSessionCookie({
        userId: validId,
        email: INITIAL_OWNER_EMAIL,
        name: user?.name || INITIAL_OWNER_NAME,
        role: 'OWNER',
      });

      // Audit log is non-blocking — don't await it
      recordAuditLog({
        userId: validId,
        action: 'OWNER_LOGIN',
        entityType: 'User',
        entityId: validId,
        details: { email: INITIAL_OWNER_EMAIL, role: 'OWNER' },
      }).catch(() => {});

    } else {
      if (!user || !user.isActive) {
        return { error: 'Invalid email or account is inactive.' };
      }

      const isMatch = await verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return { error: 'Incorrect password. Please try again.' };
      }

      await setSessionCookie({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      // Audit log is non-blocking
      recordAuditLog({
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user.id,
        details: { email: user.email, role: user.role },
      }).catch(() => {});
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
