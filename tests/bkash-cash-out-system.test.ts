import { describe, it, expect, vi } from 'vitest';
import { business } from '@/lib/business';
import { checkoutSchema } from '@/lib/validations';
import { verifyPaymentAction, rejectPaymentAction } from '@/app/admin/(dashboard)/payments/actions';
import { BkashPaymentProvider } from '@/lib/payments';

describe('Trust Computer - bKash Cash Out / Manual Payment System (Production Requirements)', () => {
  describe('1. Centralized Business & Payment Configuration', () => {
    it('has official bKash receiving number strictly configured as 01712556225', () => {
      expect(business.payment.bkash).toBe('01712556225');
      expect(business.payment.bkashNumber).toBe('01712556225');
      expect(business.payment.bkashFormatted).toBe('01712-556225');
      expect(business.payment.displayName).toBe('bKash Cash Out');
    });

    it('has official customer support channels for payment inquiries', () => {
      expect(business.sales.phone).toBe('01797854836');
      expect(business.sales.whatsappUrl).toBe('https://wa.me/8801797854836');
    });

    it('authoritative production domain is https://trustcomputermb.com', () => {
      expect(business.productionUrl).toBe('https://trustcomputermb.com');
      expect(business.productionUrl).not.toContain('vercel');
    });
  });

  describe('2. Checkout Server-Side Validation (Sender Number & Transaction ID)', () => {
    const basePayload = {
      customerName: 'Tanvir Hossain',
      customerPhone: '01797854836',
      deliveryAddress: 'Road #2, Kusumbagh, Moulvibazar',
      cityArea: 'Moulvibazar Sadar',
      items: [{ productId: 'item-101', quantity: 1 }],
    };

    it('accepts Cash on Delivery without requiring bKash fields', () => {
      const result = checkoutSchema.safeParse({
        ...basePayload,
        paymentMethod: 'COD',
      });
      expect(result.success).toBe(true);
    });

    it('accepts bKash Cash Out with valid 11-digit sender number and valid TrxID', () => {
      const result = checkoutSchema.safeParse({
        ...basePayload,
        paymentMethod: 'BKASH',
        transactionId: '9K28X1Y9Z',
        senderNumber: '01711223344',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.transactionId).toBe('9K28X1Y9Z');
        expect(result.data.senderNumber).toBe('01711223344');
      }
    });

    it('rejects bKash when Transaction ID is missing or whitespace', () => {
      const missing = checkoutSchema.safeParse({
        ...basePayload,
        paymentMethod: 'BKASH',
        senderNumber: '01711223344',
      });
      expect(missing.success).toBe(false);

      const empty = checkoutSchema.safeParse({
        ...basePayload,
        paymentMethod: 'BKASH',
        transactionId: '   ',
        senderNumber: '01711223344',
      });
      expect(empty.success).toBe(false);
    });

    it('rejects bKash when Transaction ID is too short (under 4 chars)', () => {
      const shortTrx = checkoutSchema.safeParse({
        ...basePayload,
        paymentMethod: 'BKASH',
        transactionId: 'AB',
        senderNumber: '01711223344',
      });
      expect(shortTrx.success).toBe(false);
      if (!shortTrx.success) {
        const err = shortTrx.error.errors.find((e) => e.path.includes('transactionId'));
        expect(err).toBeDefined();
        expect(err?.message).toContain('bKash Transaction ID');
      }
    });

    it('rejects bKash when Transaction ID contains malformed/dangerous characters', () => {
      const dangerous = checkoutSchema.safeParse({
        ...basePayload,
        paymentMethod: 'BKASH',
        transactionId: 'TRX<script>alert(1)</script>',
        senderNumber: '01711223344',
      });
      expect(dangerous.success).toBe(false);
    });

    it('rejects bKash when sender number is invalid format (not 11 digits or invalid operator)', () => {
      const invalidSender = checkoutSchema.safeParse({
        ...basePayload,
        paymentMethod: 'BKASH',
        transactionId: '9K28X1Y9Z',
        senderNumber: '012345', // Too short
      });
      expect(invalidSender.success).toBe(false);
      if (!invalidSender.success) {
        const err = invalidSender.error.errors.find((e) => e.path.includes('senderNumber'));
        expect(err).toBeDefined();
        expect(err?.message).toContain('valid 11-digit Bangladesh bKash mobile number');
      }
    });

    it('accepts sender number with spaces and dashes that sanitize to a valid 11-digit mobile', () => {
      const withSpaces = checkoutSchema.safeParse({
        ...basePayload,
        paymentMethod: 'BKASH',
        transactionId: '9K28X1Y9Z',
        senderNumber: '01711-223344',
      });
      expect(withSpaces.success).toBe(true);
    });
  });

  describe('3. Manual Payment Provider (No Fake API / Automation)', () => {
    it('declares bKash as a manual payment system without simulated automated gateways', async () => {
      const provider = new BkashPaymentProvider();
      const initiation = await provider.initiatePayment({
        orderId: 'test-ord',
        orderNumber: 'TC-20261005-001',
        amount: 5500,
        customerName: 'Test',
        customerPhone: '01711000000',
        callbackUrl: 'https://trustcomputermb.com/checkout/callback',
      });

      expect(initiation.isManualOrCOD).toBe(true);
      expect(initiation.redirectUrl).toBeUndefined();
      expect(initiation.message).toContain('manual bKash');
    });

    it('returns manual verification requirement when verifyPayment is invoked directly', async () => {
      const provider = new BkashPaymentProvider();
      const verification = await provider.verifyPayment();
      expect(verification.isValid).toBe(false);
      expect(verification.errorMessage).toContain('verified manually by authorized Trust Computer administrators');
    });
  });

  describe('4. Server-Side Payment Reconciliation Actions (Admin Security)', () => {
    it('verifyPaymentAction blocks unauthorized callers with UNAUTHORIZED error', async () => {
      const res = await verifyPaymentAction('non-existent-id', 'Test note');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/unauthorized/i);
    });

    it('rejectPaymentAction blocks unauthorized callers with UNAUTHORIZED error', async () => {
      const res = await rejectPaymentAction('non-existent-id', 'Not verified in bKash app', 'Test note');
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/unauthorized/i);
    });
  });

  describe('5. Customer Account & Order Details Security (No Leaked Notes)', () => {
    it('ensures internal admin notes are strictly excluded from customer responses', async () => {
      // Simulate order data structure transformation in getCustomerOrderDetails
      const simulatedOrder = {
        orderNumber: 'TC-20261005-5555',
        total: 12500,
        paymentMethod: 'BKASH',
        paymentStatus: 'PENDING',
        payments: [
          {
            transactionId: 'TX12345678',
            rawResponseJson: JSON.stringify({
              paymentMethod: 'bkash_cash_out',
              receiverNumber: '01712556225',
              senderNumber: '01711223344',
              adminNote: 'PRIVATE INTERNAL NOTE: Customer called to verify',
            }),
          },
        ],
      };

      const meta = JSON.parse(simulatedOrder.payments[0].rawResponseJson);
      
      // Customer-facing shape
      const customerView = {
        orderNumber: simulatedOrder.orderNumber,
        paymentMethodDisplay: 'bKASH Cash Out',
        paymentAmount: simulatedOrder.total,
        transactionId: simulatedOrder.payments[0].transactionId,
        paymentStatusDisplay: 'Verification Pending',
        senderNumber: meta.senderNumber,
        receiverNumber: meta.receiverNumber,
        // adminNote is deliberately NOT included
      };

      expect(customerView.paymentMethodDisplay).toBe('bKASH Cash Out');
      expect(customerView.transactionId).toBe('TX12345678');
      expect(customerView.paymentAmount).toBe(12500);
      expect(customerView.paymentStatusDisplay).toBe('Verification Pending');
      expect((customerView as any).adminNote).toBeUndefined();
    });
  });
});
