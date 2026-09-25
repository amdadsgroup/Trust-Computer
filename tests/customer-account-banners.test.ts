import { describe, it, expect } from 'vitest';
import {
  customerRegisterSchema,
  customerLoginSchema,
  customerAddressSchema,
  bannerSchema,
  offerSchema,
  checkoutSchema,
} from '../lib/validations';

describe('Customer Account & Banner System Validations', () => {
  describe('Customer Registration Schema', () => {
    it('validates a correct customer registration payload', () => {
      const valid = customerRegisterSchema.safeParse({
        fullName: 'Shiblu Ahmed',
        phone: '01753765372',
        email: 'customer@trustcomputermb.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true,
      });
      expect(valid.success).toBe(true);
    });

    it('rejects registration when password and confirm password mismatch', () => {
      const invalid = customerRegisterSchema.safeParse({
        fullName: 'Shiblu Ahmed',
        phone: '01753765372',
        email: 'customer@trustcomputermb.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword456',
        acceptTerms: true,
      });
      expect(invalid.success).toBe(false);
      if (!invalid.success) {
        expect(invalid.error.errors[0].message).toBe('Passwords do not match');
      }
    });

    it('rejects registration without terms acceptance', () => {
      const invalid = customerRegisterSchema.safeParse({
        fullName: 'Shiblu Ahmed',
        phone: '01753765372',
        email: 'customer@trustcomputermb.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: false,
      });
      expect(invalid.success).toBe(false);
    });

    it('rejects invalid Bangladeshi phone numbers', () => {
      const invalid = customerRegisterSchema.safeParse({
        fullName: 'Shiblu Ahmed',
        phone: '12345',
        email: 'customer@trustcomputermb.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true,
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('Customer Login Schema', () => {
    it('accepts valid email and password for login', () => {
      const valid = customerLoginSchema.safeParse({
        email: 'customer@example.com',
        password: 'Password123!',
        rememberMe: true,
      });
      expect(valid.success).toBe(true);
    });

    it('rejects missing or invalid email', () => {
      const invalid = customerLoginSchema.safeParse({
        email: 'invalid-email',
        password: 'Password123!',
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('Customer Address Management Schema', () => {
    it('validates a complete customer delivery address', () => {
      const valid = customerAddressSchema.safeParse({
        fullName: 'Shiblu Ahmed',
        phone: '01753765372',
        address: 'T.S Plaza (2nd Floor), Kusumbagh',
        area: 'Moulvibazar Sadar',
        city: 'Moulvibazar',
        postalCode: '3200',
        deliveryInstructions: 'Call before delivery',
        isDefault: true,
      });
      expect(valid.success).toBe(true);
    });

    it('rejects short or empty street addresses', () => {
      const invalid = customerAddressSchema.safeParse({
        fullName: 'Shiblu Ahmed',
        phone: '01753765372',
        address: 'TS',
        area: 'Moulvibazar Sadar',
        city: 'Moulvibazar',
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe('Banner Management Schema & Scheduling', () => {
    it('validates a complete promotional banner', () => {
      const valid = bannerSchema.safeParse({
        title: 'Upgrade Your PC Today',
        subtitle: 'Latest computer components and accessories',
        description: 'Special offers on Intel Core i5 and Asus components',
        desktopImageUrl: '/images/hero-banner-1.jpg',
        mobileImageUrl: '/images/hero-banner-1.jpg',
        buttonText: 'Shop Tech Deals',
        buttonUrl: '/products?category=desktop-components',
        type: 'PROMOTIONAL',
        priority: 10,
        startAt: '2026-09-01T00:00:00Z',
        endAt: '2026-10-31T23:59:59Z',
        isActive: true,
      });
      expect(valid.success).toBe(true);
    });

    it('supports different banner types: PRODUCT, CATEGORY, ANNOUNCEMENT, SEASONAL', () => {
      for (const type of ['PROMOTIONAL', 'PRODUCT', 'CATEGORY', 'ANNOUNCEMENT', 'SEASONAL'] as const) {
        const valid = bannerSchema.safeParse({
          title: `Banner for ${type}`,
          desktopImageUrl: '/images/hero-banner-1.jpg',
          type,
        });
        expect(valid.success).toBe(true);
      }
    });

    it('verifies scheduling logic correctly determines banner visibility', () => {
      const now = new Date('2026-09-24T12:00:00Z');

      const isBannerActive = (banner: {
        isActive: boolean;
        startAt?: Date | null;
        endAt?: Date | null;
      }) => {
        if (!banner.isActive) return false;
        if (banner.startAt && banner.startAt > now) return false;
        if (banner.endAt && banner.endAt < now) return false;
        return true;
      };

      // Active with no dates
      expect(isBannerActive({ isActive: true, startAt: null, endAt: null })).toBe(true);

      // Active within valid window
      expect(
        isBannerActive({
          isActive: true,
          startAt: new Date('2026-09-01T00:00:00Z'),
          endAt: new Date('2026-10-01T00:00:00Z'),
        })
      ).toBe(true);

      // Expired banner
      expect(
        isBannerActive({
          isActive: true,
          startAt: new Date('2026-08-01T00:00:00Z'),
          endAt: new Date('2026-09-20T00:00:00Z'),
        })
      ).toBe(false);

      // Future scheduled banner
      expect(
        isBannerActive({
          isActive: true,
          startAt: new Date('2026-10-01T00:00:00Z'),
          endAt: new Date('2026-11-01T00:00:00Z'),
        })
      ).toBe(false);

      // Inactive flag overrides valid dates
      expect(
        isBannerActive({
          isActive: false,
          startAt: new Date('2026-09-01T00:00:00Z'),
          endAt: new Date('2026-10-01T00:00:00Z'),
        })
      ).toBe(false);
    });
  });

  describe('Promotional Offers Schema', () => {
    it('validates a valid percentage discount offer', () => {
      const valid = offerSchema.safeParse({
        title: 'CCTV Surveillance Package Offer',
        description: 'Complete 4-camera installation setup with Dahua HD XVR',
        badge: 'HOT DEAL',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        buttonText: 'View Package',
        buttonUrl: '/categories/cctv-surveillance',
        priority: 5,
        isActive: true,
      });
      expect(valid.success).toBe(true);
    });

    it('validates a promotional-only offer without artificial discounts', () => {
      const valid = offerSchema.safeParse({
        title: 'Special Gaming PC Custom Build',
        badge: 'FEATURED',
        discountType: 'PROMOTIONAL_ONLY',
        buttonText: 'Configure PC',
        buttonUrl: '/products?category=desktop-components',
        priority: 1,
        isActive: true,
      });
      expect(valid.success).toBe(true);
    });
  });

  describe('Checkout with Optional Account Creation', () => {
    it('allows guest checkout without password', () => {
      const valid = checkoutSchema.safeParse({
        customerName: 'Guest Buyer',
        customerPhone: '01753765372',
        customerEmail: 'guest@example.com',
        deliveryAddress: 'Kusumbagh Point, Moulvibazar',
        cityArea: 'Moulvibazar Sadar',
        deliveryMethod: 'STANDARD',
        paymentMethod: 'COD',
        items: [{ productId: 'prod-1', quantity: 1 }],
      });
      expect(valid.success).toBe(true);
    });

    it('accepts checkout with account creation requested', () => {
      const valid = checkoutSchema.safeParse({
        customerName: 'New Member',
        customerPhone: '01753765372',
        customerEmail: 'member@example.com',
        deliveryAddress: 'Kusumbagh Point, Moulvibazar',
        cityArea: 'Moulvibazar Sadar',
        deliveryMethod: 'STANDARD',
        paymentMethod: 'COD',
        items: [{ productId: 'prod-1', quantity: 1 }],
        createAccount: true,
        accountPassword: 'Password123!',
      });
      expect(valid.success).toBe(true);
    });

    it('associates an existing customerId for logged-in checkout', () => {
      const valid = checkoutSchema.safeParse({
        customerName: 'Shiblu Ahmed',
        customerPhone: '01753765372',
        customerEmail: 'customer@example.com',
        deliveryAddress: 'T.S Plaza, Moulvibazar',
        cityArea: 'Moulvibazar Sadar',
        deliveryMethod: 'STANDARD',
        paymentMethod: 'COD',
        items: [{ productId: 'prod-1', quantity: 2 }],
        customerId: 'customer-uuid-1234',
      });
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.customerId).toBe('customer-uuid-1234');
      }
    });
  });
});
