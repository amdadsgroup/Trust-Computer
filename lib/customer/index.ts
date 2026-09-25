import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import prisma from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  CustomerRegisterInput,
  CustomerLoginInput,
  CustomerProfileUpdateInput,
  CustomerAddressInput,
} from '@/lib/validations';

const CUSTOMER_COOKIE_NAME = 'trust_customer_session';
const AUTH_SECRET = process.env.AUTH_SECRET || 'trust_customer_super_secure_jwt_secret_moulvibazar_2026';
const SECRET_KEY = new TextEncoder().encode(AUTH_SECRET);

export interface CustomerSessionPayload {
  customerId: string;
  email: string;
  fullName: string;
  phone?: string | null;
}

/**
 * Signs a fallback session JWT token for customers
 */
export async function signCustomerToken(payload: CustomerSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET_KEY);
}

/**
 * Verifies a customer session JWT token
 */
export async function verifyCustomerToken(token: string): Promise<CustomerSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as CustomerSessionPayload;
  } catch {
    return null;
  }
}

/**
 * Sets the customer session cookie
 */
export async function setCustomerSessionCookie(payload: CustomerSessionPayload): Promise<void> {
  const token = await signCustomerToken(payload);
  const cookieStore = cookies();
  cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Clears the customer session cookie
 */
export async function clearCustomerSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(CUSTOMER_COOKIE_NAME);
}

/**
 * Gets the currently authenticated customer profile
 */
export async function getCurrentCustomer(): Promise<{
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: Date;
} | null> {
  try {
    // 1. Check Supabase Auth if configured
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user && user.email) {
        // Fetch or sync customer profile in DB
        let profile = await prisma.customerProfile.findUnique({
          where: { id: user.id },
        });

        if (!profile) {
          profile = await prisma.customerProfile.upsert({
            where: { email: user.email },
            update: { id: user.id },
            create: {
              id: user.id,
              email: user.email,
              fullName: user.user_metadata?.full_name || user.email.split('@')[0],
              phone: user.user_metadata?.phone || null,
            },
          });
        }

        return profile;
      }
    }

    // 2. Fallback to customer session cookie
    const cookieStore = cookies();
    const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyCustomerToken(token);
    if (!payload?.customerId) return null;

    const profile = await prisma.customerProfile.findUnique({
      where: { id: payload.customerId },
    });

    return profile;
  } catch (error) {
    console.error('Failed to get current customer:', error);
    return null;
  }
}

/**
 * Asserts that the customer is authenticated, throwing an error if not
 */
export async function requireCustomer(): Promise<{
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: Date;
}> {
  const customer = await getCurrentCustomer();
  if (!customer) {
    throw new Error('UNAUTHORIZED: Please log in to your customer account.');
  }
  return customer;
}

/**
 * Registers a new customer using Supabase Auth & creates their customer profile
 */
export async function registerCustomer(input: CustomerRegisterInput): Promise<{
  success: boolean;
  customerId?: string;
  error?: string;
}> {
  try {
    const email = input.email.trim().toLowerCase();
    const fullName = input.fullName.trim();
    const phone = input.phone.trim();

    // Check if customer email already exists in local DB
    const existing = await prisma.customerProfile.findUnique({
      where: { email },
    });

    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in.',
      };
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: input.password,
        options: {
          data: {
            full_name: fullName,
            phone,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create customer profile in database
        const profile = await prisma.customerProfile.create({
          data: {
            id: data.user.id,
            email,
            fullName,
            phone,
          },
        });

        await setCustomerSessionCookie({
          customerId: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          phone: profile.phone,
        });

        return { success: true, customerId: profile.id };
      }
    }

    // Fallback mode when Supabase credentials are not yet configured
    const crypto = await import('crypto');
    const customerId = crypto.randomUUID();

    const profile = await prisma.customerProfile.create({
      data: {
        id: customerId,
        email,
        fullName,
        phone,
      },
    });

    await setCustomerSessionCookie({
      customerId: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      phone: profile.phone,
    });

    return { success: true, customerId: profile.id };
  } catch (error: any) {
    console.error('Customer registration error:', error);
    return {
      success: false,
      error: error.message || 'Registration failed. Please check your information and try again.',
    };
  }
}

/**
 * Logs in a customer using Supabase Auth
 */
export async function loginCustomer(input: CustomerLoginInput): Promise<{
  success: boolean;
  customerId?: string;
  error?: string;
}> {
  try {
    const email = input.email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: input.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Find or create profile
        let profile = await prisma.customerProfile.findUnique({
          where: { id: data.user.id },
        });

        if (!profile) {
          profile = await prisma.customerProfile.upsert({
            where: { email },
            update: { id: data.user.id },
            create: {
              id: data.user.id,
              email,
              fullName: data.user.user_metadata?.full_name || email.split('@')[0],
              phone: data.user.user_metadata?.phone || null,
            },
          });
        }

        await setCustomerSessionCookie({
          customerId: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          phone: profile.phone,
        });

        return { success: true, customerId: profile.id };
      }
    }

    // Fallback mode
    const profile = await prisma.customerProfile.findUnique({
      where: { email },
    });

    if (!profile) {
      return { success: false, error: 'Invalid email address or password.' };
    }

    await setCustomerSessionCookie({
      customerId: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      phone: profile.phone,
    });

    return { success: true, customerId: profile.id };
  } catch (error: any) {
    console.error('Customer login error:', error);
    return {
      success: false,
      error: error.message || 'Unable to sign in. Please verify your credentials.',
    };
  }
}

/**
 * Logs out the customer
 */
export async function logoutCustomer(): Promise<void> {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
  } catch (e) {
    console.error('Supabase sign out error:', e);
  } finally {
    await clearCustomerSessionCookie();
  }
}

/**
 * Fetches order history strictly for the authenticated customer
 */
export async function getCustomerOrders(customerId: string) {
  return await prisma.order.findMany({
    where: { customerId },
    include: {
      items: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Fetches single order details strictly enforcing customer ownership
 */
export async function getCustomerOrderDetails(customerId: string, orderNumber: string) {
  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      customerId,
    },
    include: {
      items: true,
      statusHistory: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          fromStatus: true,
          toStatus: true,
          note: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  // Ensure internal admin notes and sensitive fields are never exposed
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    deliveryAddress: order.deliveryAddress,
    cityArea: order.cityArea,
    deliveryMethod: order.deliveryMethod,
    deliveryFee: Number(order.deliveryFee),
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    total: Number(order.total),
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    trackingToken: order.trackingToken,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      productSku: item.productSku,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
      warrantyInfo: item.warrantyInfo,
      imageSnapshot: item.imageSnapshot,
    })),
    timeline: order.statusHistory,
  };
}

/**
 * Customer Address Operations
 */
export async function getCustomerAddresses(customerId: string) {
  return await prisma.customerAddress.findMany({
    where: { customerId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function addCustomerAddress(customerId: string, input: CustomerAddressInput) {
  // If set as default, remove default from previous addresses
  if (input.isDefault) {
    await prisma.customerAddress.updateMany({
      where: { customerId },
      data: { isDefault: false },
    });
  }

  return await prisma.customerAddress.create({
    data: {
      customerId,
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      area: input.area.trim(),
      city: input.city.trim(),
      postalCode: input.postalCode?.trim() || null,
      deliveryInstructions: input.deliveryInstructions?.trim() || null,
      isDefault: input.isDefault ?? false,
    },
  });
}

export async function updateCustomerAddress(
  customerId: string,
  addressId: string,
  input: CustomerAddressInput
) {
  // Enforce customer ownership
  const existing = await prisma.customerAddress.findFirst({
    where: { id: addressId, customerId },
  });

  if (!existing) {
    throw new Error('Address not found or permission denied.');
  }

  if (input.isDefault) {
    await prisma.customerAddress.updateMany({
      where: { customerId },
      data: { isDefault: false },
    });
  }

  return await prisma.customerAddress.update({
    where: { id: addressId },
    data: {
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      area: input.area.trim(),
      city: input.city.trim(),
      postalCode: input.postalCode?.trim() || null,
      deliveryInstructions: input.deliveryInstructions?.trim() || null,
      isDefault: input.isDefault ?? existing.isDefault,
    },
  });
}

export async function deleteCustomerAddress(customerId: string, addressId: string) {
  // Enforce customer ownership
  const existing = await prisma.customerAddress.findFirst({
    where: { id: addressId, customerId },
  });

  if (!existing) {
    throw new Error('Address not found or permission denied.');
  }

  return await prisma.customerAddress.delete({
    where: { id: addressId },
  });
}

export async function setDefaultCustomerAddress(customerId: string, addressId: string) {
  const existing = await prisma.customerAddress.findFirst({
    where: { id: addressId, customerId },
  });

  if (!existing) {
    throw new Error('Address not found or permission denied.');
  }

  await prisma.customerAddress.updateMany({
    where: { customerId },
    data: { isDefault: false },
  });

  return await prisma.customerAddress.update({
    where: { id: addressId },
    data: { isDefault: true },
  });
}

/**
 * Updates customer profile information
 */
export async function updateCustomerProfile(
  customerId: string,
  input: CustomerProfileUpdateInput
) {
  const existing = await prisma.customerProfile.findUnique({
    where: { id: customerId },
  });

  if (!existing) {
    throw new Error('Customer profile not found.');
  }

  // If email changed and Supabase is configured, trigger secure email update
  if (input.email && input.email.trim().toLowerCase() !== existing.email.toLowerCase()) {
    const newEmail = input.email.trim().toLowerCase();
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) {
        throw new Error(error.message);
      }
    }
  }

  return await prisma.customerProfile.update({
    where: { id: customerId },
    data: {
      fullName: input.fullName.trim(),
      phone: input.phone ? input.phone.trim() : null,
      email: input.email ? input.email.trim().toLowerCase() : existing.email,
    },
  });
}
