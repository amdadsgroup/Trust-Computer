'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { adminLoginSchema } from '@/lib/validations';
import { verifyPassword, setSessionCookie, clearSessionCookie, recordAuditLog } from '@/lib/auth';

export async function loginAdminAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const validation = adminLoginSchema.safeParse({ email, password });
  if (!validation.success) {
    return { error: 'অনুগ্রহ করে সঠিক ইমেইল ও পাসওয়ার্ড প্রদান করুন।' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      return { error: 'অকার্যকর ইমেইল অথবা অ্যাকাউন্টটি সক্রিয় নয়।' };
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return { error: 'ভুল পাসওয়ার্ড। পুনরায় চেষ্টা করুন।' };
    }

    // Set secure HTTP-only session cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Record audit log
    await recordAuditLog({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      details: { email: user.email, role: user.role },
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return { error: 'লগইন করার সময় একটি সমস্যা দেখা দিয়েছে।' };
  }

  redirect('/admin');
}

export async function logoutAdminAction() {
  await clearSessionCookie();
  redirect('/admin/login');
}
