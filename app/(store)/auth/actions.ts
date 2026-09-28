'use server';

import {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  updateCustomerProfile,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
  getCurrentCustomer,
  requireCustomer,
} from '@/lib/customer';
import {
  customerRegisterSchema,
  customerLoginSchema,
  customerProfileUpdateSchema,
  customerAddressSchema,
  customerPasswordResetRequestSchema,
  customerPasswordUpdateSchema,
} from '@/lib/validations';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function registerCustomerAction(data: unknown) {
  try {
    const validated = customerRegisterSchema.parse(data);
    const result = await registerCustomer(validated);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  } catch (err: any) {
    if (err.errors && err.errors[0]) {
      return { success: false, error: err.errors[0].message };
    }
    return { success: false, error: err.message || 'Registration failed' };
  }
}

export async function loginCustomerAction(data: unknown) {
  try {
    const validated = customerLoginSchema.parse(data);
    const result = await loginCustomer(validated);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true };
  } catch (err: any) {
    if (err.errors && err.errors[0]) {
      return { success: false, error: err.errors[0].message };
    }
    return { success: false, error: err.message || 'Login failed' };
  }
}

export async function logoutCustomerAction() {
  await logoutCustomer();
  revalidatePath('/', 'layout');
  redirect('/login');
}

import {
  createPasswordResetToken,
  verifyPasswordResetToken,
  resetPasswordWithToken,
  VerifyTokenResult,
} from '@/lib/auth/password-reset';
import { sendPasswordResetEmail, isEmailConfigured } from '@/lib/email';
import { hashPassword } from '@/lib/auth';
import prisma from '@/lib/db';

export async function requestPasswordResetAction(data: unknown) {
  try {
    const validated = customerPasswordResetRequestSchema.parse(data);
    const email = validated.email.trim().toLowerCase();

    // 1. Generate secure database-backed reset token
    const tokenResult = await createPasswordResetToken(email);

    let directResetUrl: string | undefined;

    // 2. If an account was found, dispatch email or provide direct reset link
    if (tokenResult.exists && tokenResult.token) {
      const origin =
        process.env.APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://trustcomputer.vercel.app');
      const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(tokenResult.token)}`;

      if (isEmailConfigured()) {
        await sendPasswordResetEmail({
          to: email,
          name: tokenResult.name || 'Valued Customer',
          resetUrl,
          expiresInMinutes: 60,
        });
      } else {
        // If email service credentials are not yet configured, provide instant direct reset link
        directResetUrl = resetUrl;
      }
    }

    // 3. Optional Supabase Auth trigger if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const origin = process.env.APP_URL || 'https://trustcomputer.vercel.app';
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/reset-password`,
        });
      } catch (sbErr) {
        console.warn('Optional Supabase password reset error (ignored):', sbErr);
      }
    }

    return {
      success: true,
      message: directResetUrl
        ? 'Your password reset link is ready!'
        : 'If an account exists with that email address, password reset instructions have been sent.',
      directResetUrl,
    };
  } catch (err: any) {
    if (err.errors && err.errors[0]) {
      return { success: false, error: err.errors[0].message };
    }
    return { success: false, error: err.message || 'Password reset request failed' };
  }
}

export async function verifyResetTokenAction(token: string): Promise<VerifyTokenResult> {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Password reset token is required.' };
    }

    const verification = await verifyPasswordResetToken(token);
    return verification;
  } catch (err: any) {
    return { valid: false, error: err.message || 'Failed to verify reset token.' };
  }
}

export async function updateCustomerPasswordAction(data: unknown) {
  try {
    const rawData = data as Record<string, unknown> | undefined;

    // A. If a reset token is supplied, reset via secure token verification
    if (rawData?.token && typeof rawData.token === 'string') {
      const validated = customerPasswordUpdateSchema.parse(data);
      const result = await resetPasswordWithToken(rawData.token, validated.password);

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to update password.' };
      }

      return {
        success: true,
        message: result.message || 'Password has been updated successfully.',
      };
    }

    // B. If no token, user must be logged in to update their password
    const validated = customerPasswordUpdateSchema.parse(data);
    const customer = await getCurrentCustomer();

    if (!customer) {
      return {
        success: false,
        error: 'Authentication required. Please use the reset link sent to your email or log in.',
      };
    }

    // Hash and update local database profile
    const newPasswordHash = await hashPassword(validated.password);
    await prisma.customerProfile.update({
      where: { id: customer.id },
      data: { passwordHash: newPasswordHash },
    });

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.updateUser({ password: validated.password });
    }

    return { success: true, message: 'Password has been updated successfully.' };
  } catch (err: any) {
    if (err.errors && err.errors[0]) {
      return { success: false, error: err.errors[0].message };
    }
    return { success: false, error: err.message || 'Failed to update password' };
  }
}

export async function updateCustomerProfileAction(data: unknown) {
  try {
    const customer = await requireCustomer();
    const validated = customerProfileUpdateSchema.parse(data);
    await updateCustomerProfile(customer.id, validated);
    revalidatePath('/account/profile');
    revalidatePath('/account');
    return { success: true, message: 'Profile updated successfully.' };
  } catch (err: any) {
    if (err.errors && err.errors[0]) {
      return { success: false, error: err.errors[0].message };
    }
    return { success: false, error: err.message || 'Failed to update profile' };
  }
}

export async function addCustomerAddressAction(data: unknown) {
  try {
    const customer = await requireCustomer();
    const validated = customerAddressSchema.parse(data);
    await addCustomerAddress(customer.id, validated);
    revalidatePath('/account/addresses');
    return { success: true, message: 'Address added successfully.' };
  } catch (err: any) {
    if (err.errors && err.errors[0]) {
      return { success: false, error: err.errors[0].message };
    }
    return { success: false, error: err.message || 'Failed to add address' };
  }
}

export async function updateCustomerAddressAction(addressId: string, data: unknown) {
  try {
    const customer = await requireCustomer();
    const validated = customerAddressSchema.parse(data);
    await updateCustomerAddress(customer.id, addressId, validated);
    revalidatePath('/account/addresses');
    return { success: true, message: 'Address updated successfully.' };
  } catch (err: any) {
    if (err.errors && err.errors[0]) {
      return { success: false, error: err.errors[0].message };
    }
    return { success: false, error: err.message || 'Failed to update address' };
  }
}

export async function deleteCustomerAddressAction(addressId: string) {
  try {
    const customer = await requireCustomer();
    await deleteCustomerAddress(customer.id, addressId);
    revalidatePath('/account/addresses');
    return { success: true, message: 'Address deleted successfully.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete address' };
  }
}

export async function setDefaultCustomerAddressAction(addressId: string) {
  try {
    const customer = await requireCustomer();
    await setDefaultCustomerAddress(customer.id, addressId);
    revalidatePath('/account/addresses');
    return { success: true, message: 'Default address updated.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to set default address' };
  }
}
