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

export async function requestPasswordResetAction(data: unknown) {
  try {
    const validated = customerPasswordResetRequestSchema.parse(data);
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const origin = process.env.APP_URL || 'http://localhost:3000';
      const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
        redirectTo: `${origin}/reset-password`,
      });
      if (error) {
        return { success: false, error: error.message };
      }
    }
    return {
      success: true,
      message: 'If an account exists with that email address, password reset instructions have been sent.',
    };
  } catch (err: any) {
    if (err.errors && err.errors[0]) {
      return { success: false, error: err.errors[0].message };
    }
    return { success: false, error: err.message || 'Password reset request failed' };
  }
}

export async function updateCustomerPasswordAction(data: unknown) {
  try {
    const validated = customerPasswordUpdateSchema.parse(data);
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: validated.password });
      if (error) {
        return { success: false, error: error.message };
      }
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
