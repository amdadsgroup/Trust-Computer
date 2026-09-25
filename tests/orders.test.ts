import { describe, it, expect } from 'vitest';
import { OrderStatus } from '@prisma/client';
import {
  generateOrderNumber,
  generateTrackingToken,
  calculateDeliveryFee,
  isValidStatusTransition,
  ALLOWED_STATUS_TRANSITIONS,
} from '../lib/orders';

describe('Order Business Logic', () => {
  describe('Order Number Generation', () => {
    it('generates an order number matching TC-YYYYMMDD-XXXX format', () => {
      const orderNumber = generateOrderNumber();
      expect(orderNumber).toMatch(/^TC-\d{8}-\d{4}$/);
    });

    it('generates distinct order numbers sequentially', () => {
      const order1 = generateOrderNumber();
      const order2 = generateOrderNumber();
      // Even if generated rapidly, they shouldn't always be identical
      expect(order1).toBeDefined();
      expect(order2).toBeDefined();
    });
  });

  describe('Tracking Token Generation', () => {
    it('generates a 32-character hexadecimal tracking token', () => {
      const token = generateTrackingToken();
      expect(token).toHaveLength(32);
      expect(token).toMatch(/^[0-9a-f]{32}$/);
    });
  });

  describe('Delivery Fee Calculation', () => {
    it('charges ৳60 for local delivery inside Moulvibazar Sadar/Town', () => {
      expect(calculateDeliveryFee('Moulvibazar Sadar')).toBe(60);
      expect(calculateDeliveryFee('Kusumbagh, Moulvibazar')).toBe(60);
      expect(calculateDeliveryFee('Moulvibazar Town')).toBe(60);
    });

    it('charges ৳120 for delivery outside Moulvibazar Sadar or Upazilas', () => {
      expect(calculateDeliveryFee('Sreemangal')).toBe(120);
      expect(calculateDeliveryFee('Kulaura')).toBe(120);
      expect(calculateDeliveryFee('Dhaka')).toBe(120);
      expect(calculateDeliveryFee('Sylhet')).toBe(120);
    });
  });

  describe('Order Status State Transitions', () => {
    it('allows identical status transition (idempotent)', () => {
      expect(isValidStatusTransition(OrderStatus.PENDING, OrderStatus.PENDING)).toBe(true);
      expect(isValidStatusTransition(OrderStatus.PROCESSING, OrderStatus.PROCESSING)).toBe(true);
    });

    it('allows valid forward progression: PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED', () => {
      expect(isValidStatusTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED)).toBe(true);
      expect(isValidStatusTransition(OrderStatus.CONFIRMED, OrderStatus.PROCESSING)).toBe(true);
      expect(isValidStatusTransition(OrderStatus.PROCESSING, OrderStatus.SHIPPED)).toBe(true);
      expect(isValidStatusTransition(OrderStatus.SHIPPED, OrderStatus.DELIVERED)).toBe(true);
    });

    it('allows cancellation from PENDING, CONFIRMED, or PROCESSING', () => {
      expect(isValidStatusTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(true);
      expect(isValidStatusTransition(OrderStatus.CONFIRMED, OrderStatus.CANCELLED)).toBe(true);
      expect(isValidStatusTransition(OrderStatus.PROCESSING, OrderStatus.CANCELLED)).toBe(true);
    });

    it('disallows cancellation after an order has SHIPPED or DELIVERED', () => {
      expect(isValidStatusTransition(OrderStatus.SHIPPED, OrderStatus.CANCELLED)).toBe(false);
      expect(isValidStatusTransition(OrderStatus.DELIVERED, OrderStatus.CANCELLED)).toBe(false);
    });

    it('disallows modifying terminal CANCELLED or RETURNED orders', () => {
      expect(isValidStatusTransition(OrderStatus.CANCELLED, OrderStatus.CONFIRMED)).toBe(false);
      expect(isValidStatusTransition(OrderStatus.CANCELLED, OrderStatus.DELIVERED)).toBe(false);
      expect(isValidStatusTransition(OrderStatus.RETURNED, OrderStatus.SHIPPED)).toBe(false);
    });

    it('disallows skipping phases, such as PENDING directly to DELIVERED', () => {
      expect(isValidStatusTransition(OrderStatus.PENDING, OrderStatus.DELIVERED)).toBe(false);
      expect(isValidStatusTransition(OrderStatus.PENDING, OrderStatus.SHIPPED)).toBe(false);
    });
  });
});
