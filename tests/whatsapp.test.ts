import { describe, it, expect } from 'vitest';
import {
  TC_WHATSAPP_NUMBER,
  getGeneralWhatsAppLink,
  getProductInquiryWhatsAppLink,
  getOrderInquiryWhatsAppLink,
  getCartInquiryWhatsAppLink,
} from '../lib/whatsapp';

describe('WhatsApp Integration', () => {
  it('uses the verified Bangladesh international number format (8801753765372)', () => {
    expect(TC_WHATSAPP_NUMBER).toBe('8801753765372');
  });

  it('generates a valid general inquiry link with URL encoded text', () => {
    const link = getGeneralWhatsAppLink();
    expect(link).toContain('https://wa.me/8801753765372?text=');
    expect(link).toContain(encodeURIComponent('Trust Computer'));
  });

  it('generates a product inquiry link containing product details', () => {
    const link = getProductInquiryWhatsAppLink({
      name: 'Hikvision 4 Channel HD DVR',
      sku: 'DS-7204HGHI-K1',
      price: 3600,
      slug: 'hikvision-4-channel-hd-dvr',
    });

    expect(link).toContain('https://wa.me/8801753765372?text=');
    expect(decodeURIComponent(link)).toContain('Hikvision 4 Channel HD DVR');
    expect(decodeURIComponent(link)).toContain('DS-7204HGHI-K1');
    expect(decodeURIComponent(link)).toContain('3,600');
    expect(decodeURIComponent(link)).toContain('hikvision-4-channel-hd-dvr');
  });

  it('generates an order inquiry link without leaking private customer data', () => {
    const link = getOrderInquiryWhatsAppLink({
      orderNumber: 'TC-20260924-8841',
      total: 4500,
    });

    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('TC-20260924-8841');
    expect(decoded).toContain('4,500');
    // Ensure no phone numbers or customer addresses are in this link
    expect(decoded).not.toContain('Kusumbagh');
  });

  it('generates a cart inquiry link with items list and total', () => {
    const link = getCartInquiryWhatsAppLink(
      [
        { name: 'Cat6 Network Cable 305m', quantity: 1 },
        { name: 'RJ45 Connectors 100pcs', quantity: 2 },
      ],
      7500
    );

    const decoded = decodeURIComponent(link);
    expect(decoded).toContain('Cat6 Network Cable 305m (x1)');
    expect(decoded).toContain('RJ45 Connectors 100pcs (x2)');
    expect(decoded).toContain('7,500');
  });
});
