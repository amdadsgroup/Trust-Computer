'use server';

import { checkoutSchema } from '@/lib/validations';
import { createOrderTransactionally } from '@/lib/orders';
import { getCurrentCustomer, registerCustomer } from '@/lib/customer';

export interface CheckoutActionResult {
  success: boolean;
  orderNumber?: string;
  trackingToken?: string;
  customerId?: string;
  error?: string;
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
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while processing your order. Please try again.',
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
