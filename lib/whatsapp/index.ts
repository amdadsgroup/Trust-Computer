/**
 * Trust Computer - WhatsApp Integration Utilities
 * Single Source of Truth: lib/business.ts
 * 
 * Official Numbers:
 * Sales & Customer Care: 01797854836 -> 8801797854836 (https://wa.me/8801797854836)
 * Service & Support: 01608346407 -> 8801608346407 (https://wa.me/8801608346407)
 */

import {
  business,
  getSalesWhatsAppLink,
  getServiceWhatsAppLink,
  getProductSalesWhatsAppLink,
  getOrderWhatsAppLink,
  getCartWhatsAppLink,
} from '@/lib/business';

// Authoritative numbers derived from centralized business config
export const TC_WHATSAPP_NUMBER = business.sales.whatsapp; // 8801797854836
export const TC_SALES_WHATSAPP_NUMBER = business.sales.whatsapp; // 8801797854836
export const TC_SERVICE_WHATSAPP_NUMBER = business.service.whatsapp; // 8801608346407

// Re-export helpers
export {
  getSalesWhatsAppLink,
  getServiceWhatsAppLink,
  getProductSalesWhatsAppLink,
  getOrderWhatsAppLink,
  getCartWhatsAppLink,
};

// Aliases for backward compatibility
export const getGeneralWhatsAppLink = getSalesWhatsAppLink;
export const getProductInquiryWhatsAppLink = getProductSalesWhatsAppLink;
export const getOrderInquiryWhatsAppLink = getOrderWhatsAppLink;
export const getCartInquiryWhatsAppLink = getCartWhatsAppLink;
