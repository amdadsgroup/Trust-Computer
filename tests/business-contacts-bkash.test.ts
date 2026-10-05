import { describe, it, expect } from 'vitest';
import {
  business,
  getSalesWhatsAppLink,
  getServiceWhatsAppLink,
  getProductSalesWhatsAppLink,
  getOrderWhatsAppLink,
  getCartWhatsAppLink,
} from '@/lib/business';
import { checkoutSchema } from '@/lib/validations';
import { verifyPaymentAction, rejectPaymentAction } from '@/app/admin/(dashboard)/payments/actions';
import { updateStoreSettingsAction } from '@/app/admin/(dashboard)/settings/actions';

describe('Trust Computer - Business Contacts & bKash Payment Workflow', () => {
  describe('1. Centralized Business Contact Truth (lib/business.ts)', () => {
    it('has correct official sales contact details', () => {
      expect(business.sales.phone).toBe('01797854836');
      expect(business.sales.whatsapp).toBe('8801797854836');
      expect(business.sales.whatsappUrl).toBe('https://wa.me/8801797854836');
      expect(business.sales.tel).toBe('tel:01797854836');
    });

    it('has correct official service & repair contact details', () => {
      expect(business.service.phone).toBe('01608346407');
      expect(business.service.whatsapp).toBe('8801608346407');
      expect(business.service.whatsappUrl).toBe('https://wa.me/8801608346407');
      expect(business.service.tel).toBe('tel:01608346407');
    });

    it('has correct official bKash payment / cash out number', () => {
      expect(business.payment.bkash).toBe('01712556225');
      expect(business.payment.method).toBe('bKash');
    });

    it('points to authoritative production domain', () => {
      expect(business.productionUrl).toBe('https://trustcomputermb.com');
      expect(business.productionUrl).not.toContain('vercel.app');
    });
  });

  describe('2. WhatsApp Link Generation', () => {
    it('generates sales WhatsApp link with default text', () => {
      const link = getSalesWhatsAppLink('Hello Trust Computer, I need sales assistance');
      expect(link).toBe('https://wa.me/8801797854836?text=Hello%20Trust%20Computer%2C%20I%20need%20sales%20assistance');
    });

    it('generates service WhatsApp link with service number', () => {
      const link = getServiceWhatsAppLink('I need CCTV repair assistance');
      expect(link).toContain('https://wa.me/8801608346407?text=');
      expect(decodeURIComponent(link)).toContain('CCTV repair assistance');
    });

    it('generates product-specific sales WhatsApp link with product details', () => {
      const link = getProductSalesWhatsAppLink({
        name: 'Hikvision 2MP Dome Camera',
        sku: 'DS-2CE56D0T-IPECO',
        price: 1850,
        slug: 'hikvision-2mp-dome-camera',
      });
      expect(link).toContain('https://wa.me/8801797854836?text=');
      expect(decodeURIComponent(link)).toContain('Hikvision 2MP Dome Camera');
      expect(decodeURIComponent(link)).toContain('1,850');
      expect(decodeURIComponent(link)).toContain('DS-2CE56D0T-IPECO');
    });

    it('generates order WhatsApp link with order number and total', () => {
      const link = getOrderWhatsAppLink({
        orderNumber: 'TC-20261005-9988',
        total: 12500,
      });
      expect(link).toContain('https://wa.me/8801797854836?text=');
      expect(decodeURIComponent(link)).toContain('TC-20261005-9988');
      expect(decodeURIComponent(link)).toContain('12,500');
    });

    it('generates cart WhatsApp link with item list', () => {
      const link = getCartWhatsAppLink(
        [{ name: 'TP-Link Archer C6', quantity: 1 }],
        3200
      );
      expect(link).toContain('https://wa.me/8801797854836?text=');
      expect(decodeURIComponent(link)).toContain('TP-Link Archer C6 (x1)');
    });
  });

  describe('3. bKash Checkout Validation Schema', () => {
    const basePayload = {
      customerName: 'Rahim Ullah',
      customerPhone: '01797854836',
      deliveryAddress: 'Central Road, Moulvibazar Sadar',
      cityArea: 'Moulvibazar Sadar',
      items: [{ productId: 'test-prod-1', quantity: 1 }],
    };

    it('passes validation when COD is selected without transactionId', () => {
      const result = checkoutSchema.safeParse({
        ...basePayload,
        paymentMethod: 'COD',
      });
      expect(result.success).toBe(true);
    });

    it('passes validation when BKASH is selected with valid transactionId', () => {
      const result = checkoutSchema.safeParse({
        ...basePayload,
        paymentMethod: 'BKASH',
        transactionId: '9K8J7H6G5F',
        senderNumber: '01712000000',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.transactionId).toBe('9K8J7H6G5F');
      }
    });

    it('fails validation when BKASH is selected without transactionId', () => {
      const result = checkoutSchema.safeParse({
        ...basePayload,
        paymentMethod: 'BKASH',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.errors.find((e) => e.path.includes('transactionId'));
        expect(error).toBeDefined();
        expect(error?.message).toContain('bKash Transaction ID');
      }
    });

    it('fails validation when BKASH is selected with whitespace-only transactionId', () => {
      const result = checkoutSchema.safeParse({
        ...basePayload,
        paymentMethod: 'BKASH',
        transactionId: '    ',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('4. Server-Side Payment Reconciliation Actions', () => {
    it('exports verifyPaymentAction and rejects unauthorized access', async () => {
      expect(typeof verifyPaymentAction).toBe('function');
      const result = await verifyPaymentAction({ paymentId: 'dummy-id' });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/unauthorized/i);
    });

    it('exports rejectPaymentAction and rejects unauthorized access', async () => {
      expect(typeof rejectPaymentAction).toBe('function');
      const result = await rejectPaymentAction({
        paymentId: 'dummy-id',
        rejectionReason: 'Invalid transaction ID',
      });
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/unauthorized/i);
    });

    it('exports updateStoreSettingsAction for business contact management and requires auth', async () => {
      expect(typeof updateStoreSettingsAction).toBe('function');
      const formData = new FormData();
      formData.append('phone', '01797854836');
      formData.append('whatsappNumber', '+8801797854836');
      formData.append('servicePhone', '01608346407');
      formData.append('serviceWhatsapp', '+8801608346407');
      formData.append('bkashNumber', '01712556225');
      
      await expect(updateStoreSettingsAction(formData)).rejects.toThrow(/unauthorized/i);
    });
  });
});
