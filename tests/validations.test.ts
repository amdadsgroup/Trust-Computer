import { describe, it, expect } from 'vitest';
import {
  adminLoginSchema,
  productCreateSchema,
  checkoutSchema,
  stockAdjustmentSchema,
  orderTrackingSchema,
} from '../lib/validations';

describe('Validation Schemas', () => {
  describe('Admin Login Schema', () => {
    it('validates a correct email and password', () => {
      const valid = adminLoginSchema.safeParse({
        email: 'trustcomputermb@gmail.com',
        password: 'password123',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects invalid email formats', () => {
      const invalid = adminLoginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(invalid.success).toBe(false);
    });

    it('rejects passwords shorter than 6 characters', () => {
      const invalid = adminLoginSchema.safeParse({
        email: 'admin@trustcomputermb.com',
        password: '123',
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('Product Create Schema', () => {
    it('validates complete and valid product input', () => {
      const valid = productCreateSchema.safeParse({
        name: 'Dahua 2MP HD Bullet CCTV Camera',
        slug: 'dahua-2mp-hd-bullet-cctv-camera',
        sku: 'DH-HAC-B1A21N',
        description: 'High quality 2MP IR bullet camera for security surveillance.',
        sellingPrice: 1850,
        compareAtPrice: 2100,
        costPrice: 1500,
        stock: 25,
        lowStockThreshold: 5,
        isFeatured: true,
        isActive: true,
        warrantyInfo: '1 Year Brand Warranty',
        categoryId: 'cat-cctv-123',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects uppercase letters and spaces in product slugs', () => {
      const invalid = productCreateSchema.safeParse({
        name: 'Invalid Slug Product',
        slug: 'Invalid Slug Here!',
        sku: 'SKU-001',
        description: 'Valid product description for testing.',
        sellingPrice: 1000,
        stock: 5,
        categoryId: 'cat-1',
      });
      expect(invalid.success).toBe(false);
    });

    it('rejects negative selling price and negative stock', () => {
      const invalid = productCreateSchema.safeParse({
        name: 'Negative Product',
        slug: 'negative-product',
        sku: 'SKU-NEG',
        description: 'Valid product description for testing.',
        sellingPrice: -100,
        stock: -5,
        categoryId: 'cat-1',
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('Checkout Schema', () => {
    it('validates a proper Bangladeshi customer checkout form', () => {
      const valid = checkoutSchema.safeParse({
        customerName: 'Shiblu Ahmed',
        customerPhone: '01753765372',
        customerEmail: 'shiblu@example.com',
        deliveryAddress: 'T.S Plaza (2nd Floor), Kusumbagh, Moulvibazar',
        cityArea: 'Moulvibazar Sadar',
        notes: 'Please call before delivery',
        deliveryMethod: 'STANDARD',
        paymentMethod: 'COD',
        items: [{ productId: 'prod-123', quantity: 2 }],
      });
      expect(valid.success).toBe(true);
    });

    it('accepts Bangladeshi phone with +880 prefix', () => {
      const valid = checkoutSchema.safeParse({
        customerName: 'Kazi Tanvir',
        customerPhone: '+8801753765372',
        deliveryAddress: 'Chowmuhana, Sreemangal Road, Moulvibazar',
        cityArea: 'Moulvibazar Sadar',
        items: [{ productId: 'prod-456', quantity: 1 }],
      });
      expect(valid.success).toBe(true);
    });

    it('rejects invalid or international phone numbers without BD format', () => {
      const invalid = checkoutSchema.safeParse({
        customerName: 'Test User',
        customerPhone: '12345678',
        deliveryAddress: 'Road 5, Block B',
        cityArea: 'Moulvibazar Sadar',
        items: [{ productId: 'prod-123', quantity: 1 }],
      });
      expect(invalid.success).toBe(false);
    });

    it('rejects an empty cart (0 items)', () => {
      const invalid = checkoutSchema.safeParse({
        customerName: 'Test User',
        customerPhone: '01711223344',
        deliveryAddress: 'Road 5, Block B',
        cityArea: 'Moulvibazar Sadar',
        items: [],
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('Stock Adjustment Schema', () => {
    it('rejects a stock adjustment with 0 quantity', () => {
      const invalid = stockAdjustmentSchema.safeParse({
        productId: 'prod-1',
        type: 'ADJUSTMENT',
        quantity: 0,
        reason: 'Zero test',
      });
      expect(invalid.success).toBe(false);
    });

    it('accepts positive and negative adjustments with valid reason', () => {
      const add = stockAdjustmentSchema.safeParse({
        productId: 'prod-1',
        type: 'RECEIVE',
        quantity: 10,
        reason: 'Received shipment from supplier',
      });
      const remove = stockAdjustmentSchema.safeParse({
        productId: 'prod-1',
        type: 'ADJUSTMENT',
        quantity: -2,
        reason: 'Damaged during inspection',
      });
      expect(add.success).toBe(true);
      expect(remove.success).toBe(true);
    });
  });

  describe('Order Tracking Schema', () => {
    it('validates tracking lookup inputs', () => {
      const valid = orderTrackingSchema.safeParse({
        orderNumber: 'TC-20260924-1234',
        phone: '01753765372',
      });
      expect(valid.success).toBe(true);
    });
  });
});
