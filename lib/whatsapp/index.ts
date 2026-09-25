/**
 * Trust Computer - WhatsApp Integration Utilities
 * Business WhatsApp: 01753-765372 (+8801753765372)
 */

export const TC_WHATSAPP_NUMBER = '8801753765372';

export function getGeneralWhatsAppLink(customMessage?: string): string {
  const defaultText = `আসসালামু আলাইকুম, Trust Computer Moulvibazar-এ যোগাযোগ করতে চাচ্ছি।`;
  const text = customMessage || defaultText;
  return `https://wa.me/${TC_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function getProductInquiryWhatsAppLink(product: {
  name: string;
  sku: string;
  price: number;
  slug: string;
  baseUrl?: string;
}): string {
  const host = product.baseUrl || 'https://trustcomputermb.com';
  const url = `${host}/products/${product.slug}`;
  const text = `আসসালামু আলাইকুম Trust Computer,\nআমি এই পণ্যটি সম্পর্কে জানতে আগ্রহী:\n- পণ্য: ${product.name}\n- SKU: ${product.sku}\n- মূল্য: ৳${product.price.toLocaleString('en-BD')}\n- লিংক: ${url}`;
  return `https://wa.me/${TC_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function getOrderInquiryWhatsAppLink(order: {
  orderNumber: string;
  total: number;
}): string {
  const text = `আসসালামু আলাইকুম Trust Computer,\nআমার অর্ডার সম্পর্কিত তথ্য জানতে চাচ্ছি:\n- অর্ডার নং: ${order.orderNumber}\n- মোট মূল্য: ৳${order.total.toLocaleString('en-BD')}`;
  return `https://wa.me/${TC_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function getCartInquiryWhatsAppLink(items: Array<{ name: string; quantity: number }>, total: number): string {
  const itemsText = items.map((i) => `• ${i.name} (x${i.quantity})`).join('\n');
  const text = `আসসালামু আলাইকুম Trust Computer,\nআমি নিম্নলিখিত পণ্যগুলো অর্ডার করার বিষয়ে পরামর্শ চাচ্ছি:\n${itemsText}\nআনুমানিক সর্বমোট: ৳${total.toLocaleString('en-BD')}`;
  return `https://wa.me/${TC_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
