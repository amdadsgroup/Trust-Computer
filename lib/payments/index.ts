import { PaymentMethod, PaymentStatus } from '@prisma/client';
import prisma from '@/lib/db';

export interface PaymentInitiationRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  callbackUrl: string;
}

export interface PaymentInitiationResult {
  provider: PaymentMethod;
  redirectUrl?: string;
  status: PaymentStatus;
  transactionId?: string;
  message?: string;
  isManualOrCOD: boolean;
}

export interface PaymentVerificationResult {
  isValid: boolean;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  providerRawResponse?: Record<string, unknown>;
  errorMessage?: string;
}

export interface IPaymentProvider {
  initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult>;
  verifyPayment(payload: Record<string, unknown>): Promise<PaymentVerificationResult>;
}

/**
 * Cash on Delivery (COD) Provider
 */
export class CashOnDeliveryProvider implements IPaymentProvider {
  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    return {
      provider: PaymentMethod.COD,
      status: PaymentStatus.PENDING,
      isManualOrCOD: true,
      message: 'Cash on delivery selected. Payment will be collected upon product handover.',
    };
  }

  async verifyPayment(): Promise<PaymentVerificationResult> {
    return {
      isValid: true,
      transactionId: `COD-${Date.now()}`,
      amount: 0,
      status: PaymentStatus.PENDING,
    };
  }
}

/**
 * bKash Payment Provider - Manual Payment System
 * Trust Computer operates a manual bKash cash out / payment system to official number 01712556225.
 * Automated verification or simulated demo callbacks are strictly prohibited.
 */
export class BkashPaymentProvider implements IPaymentProvider {
  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    return {
      provider: PaymentMethod.BKASH,
      status: PaymentStatus.PENDING,
      isManualOrCOD: true,
      message:
        'Trust Computer operates a manual bKash Cash Out payment system. Customer pays to 01712556225 and submits Transaction ID for admin verification.',
    };
  }

  async verifyPayment(): Promise<PaymentVerificationResult> {
    return {
      isValid: false,
      transactionId: '',
      amount: 0,
      status: PaymentStatus.PENDING,
      errorMessage: 'bKash payments are verified manually by authorized Trust Computer administrators.',
    };
  }
}

/**
 * SSLCOMMERZ Payment Provider Abstraction
 */
export class SslcommerzPaymentProvider implements IPaymentProvider {
  private storeId = process.env.SSLCOMMERZ_STORE_ID;
  private storePass = process.env.SSLCOMMERZ_STORE_PASSWORD;
  private isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';

  isConfigured(): boolean {
    return Boolean(this.storeId && this.storePass);
  }

  async initiatePayment(request: PaymentInitiationRequest): Promise<PaymentInitiationResult> {
    if (!this.isConfigured()) {
      return {
        provider: PaymentMethod.SSLCOMMERZ,
        status: PaymentStatus.PENDING,
        isManualOrCOD: true,
        message:
          'SSLCOMMERZ merchant gateway is pending verification. Please proceed with Cash on Delivery or contact us via WhatsApp.',
      };
    }

    return {
      provider: PaymentMethod.SSLCOMMERZ,
      status: PaymentStatus.PENDING,
      isManualOrCOD: false,
      redirectUrl: `https://${this.isLive ? 'securepay' : 'sandbox'}.sslcommerz.com/gwprocess/v4/demo?order=${request.orderNumber}`,
    };
  }

  async verifyPayment(payload: Record<string, unknown>): Promise<PaymentVerificationResult> {
    if (!this.isConfigured()) {
      return {
        isValid: false,
        transactionId: '',
        amount: 0,
        status: PaymentStatus.FAILED,
        errorMessage: 'SSLCOMMERZ credentials are not configured.',
      };
    }

    const valId = String(payload.val_id || payload.tran_id || '');
    const status = payload.status === 'VALID' ? PaymentStatus.PAID : PaymentStatus.FAILED;

    return {
      isValid: status === PaymentStatus.PAID,
      transactionId: valId,
      amount: Number(payload.amount || 0),
      status,
      providerRawResponse: payload,
    };
  }
}

/**
 * Factory to retrieve the requested payment provider
 */
export function getPaymentProvider(method: PaymentMethod): IPaymentProvider {
  switch (method) {
    case PaymentMethod.BKASH:
      return new BkashPaymentProvider();
    case PaymentMethod.SSLCOMMERZ:
      return new SslcommerzPaymentProvider();
    case PaymentMethod.COD:
    case PaymentMethod.BANK_TRANSFER:
    case PaymentMethod.NAGAD:
    default:
      return new CashOnDeliveryProvider();
  }
}
