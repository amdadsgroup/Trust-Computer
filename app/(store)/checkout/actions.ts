'use server';

import { checkoutSchema } from '@/lib/validations';
import { createOrderTransactionally } from '@/lib/orders';
import { getCurrentCustomer, registerCustomer } from '@/lib/customer';
import { validateCoupon, CouponValidationResult } from '@/lib/coupons';

export interface CheckoutActionResult {
  success: boolean;
  orderNumber?: string;
  trackingToken?: string;
  customerId?: string;
  error?: string;
}

export async function validateCouponAction(params: {
  code: string;
  orderSubtotal: number;
}): Promise<CouponValidationResult> {
  try {
    const currentCustomer = await getCurrentCustomer();
    return await validateCoupon({
      code: params.code,
      orderSubtotal: params.orderSubtotal,
      customerId: currentCustomer?.id,
    });
  } catch (err: any) {
    console.error('Coupon validation action error:', err);
    return {
      valid: false,
      message: err.message || 'Could not validate coupon at this time. Please try again.',
    };
  }
}

export async function submitCheckoutAction(data: unknown): Promise<CheckoutActionResult> {
  try {
    // 1. Validate payload using strict server-side Zod schema
    const validatedData = checkoutSchema.parse(data);

    // 2. Check if customer is already logged in
    const currentCustomer = await getCurrentCustomer();
    let customerId = currentCustomer?.id || validatedData.customerId;

    // 3. If guest requested account creation during checkout
    if (!customerId && validatedData.createAccount && validatedData.accountPassword && validatedData.customerEmail) {
      const regResult = await registerCustomer({
        fullName: validatedData.customerName,
        phone: validatedData.customerPhone,
        email: validatedData.customerEmail,
        password: validatedData.accountPassword,
        confirmPassword: validatedData.accountPassword,
        acceptTerms: true,
      });

      if (regResult.success && regResult.customerId) {
        customerId = regResult.customerId;
      }
    }

    // 4. Attach resolved customer ID to order
    validatedData.customerId = customerId;

    // 5. Execute transactional order creation
    const order = await createOrderTransactionally(validatedData);

    return {
      success: true,
      orderNumber: order.orderNumber,
      trackingToken: order.trackingToken,
      customerId,
    };
  } catch (err: any) {
    console.error('Checkout processing error:', err);
    let errorMessage = err.message || 'An unexpected error occurred while processing your order. Please try again.';
    if (
      err.code === 'P2002' ||
      errorMessage.includes('transaction ID has already been submitted') ||
      errorMessage.includes('payments_transactionId_key') ||
      errorMessage.includes('transactionId')
    ) {
      errorMessage =
        'This transaction ID has already been submitted. Please contact Trust Computer if you believe this is an error.';
    } else if (errorMessage.includes('Transaction API error') || errorMessage.includes('Transaction not found')) {
      errorMessage = 'Database transaction timed out. Your order has not been placed. Please try submitting again.';
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getCheckoutCustomerDataAction() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return { customer: null, addresses: [] };
  }

  const { getCustomerAddresses } = await import('@/lib/customer');
  const addresses = await getCustomerAddresses(customer.id);

  return {
    customer: {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
    },
    addresses,
  };
}
