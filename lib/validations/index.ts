import { z } from 'zod';

// Bangladeshi phone regex: matches 01XXXXXXXXX or +8801XXXXXXXXX
export const bdPhoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;

export const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const productSpecificationSchema = z.object({
  group: z.string().default('General'),
  key: z.string().min(1, 'Specification name is required'),
  value: z.string().min(1, 'Specification value is required'),
  sortOrder: z.number().int().default(0),
});

export const productImageSchema = z.object({
  url: z.string().url('Image URL must be valid'),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const productVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().min(2, 'Variant SKU is required'),
  price: z.number().positive('Price must be greater than 0'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  attributesJson: z.string().optional(),
});

export const productCreateSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case alphanumeric with dashes'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  barcode: z.string().optional().nullable(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  sellingPrice: z.number().positive('Selling price must be greater than 0'),
  compareAtPrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0, 'Initial stock cannot be negative'),
  lowStockThreshold: z.number().int().min(0).default(3),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  warrantyInfo: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().optional().nullable(),
  images: z.array(productImageSchema).default([]),
  specifications: z.array(productSpecificationSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case alphanumeric with dashes'),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const brandSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case alphanumeric with dashes'),
  description: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type BrandInput = z.infer<typeof brandSchema>;

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Maximum 20 units per item'),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  customerPhone: z.string().regex(bdPhoneRegex, 'Please enter a valid Bangladesh phone number (e.g. 01753765372)'),
  customerEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  deliveryAddress: z.string().min(5, 'Delivery address must be at least 5 characters').max(300),
  cityArea: z.string().min(2, 'Please select your delivery zone / city'),
  notes: z.string().max(500).optional().or(z.literal('')),
  deliveryMethod: z.enum(['STANDARD', 'EXPRESS']).default('STANDARD'),
  paymentMethod: z.enum(['COD', 'BKASH', 'NAGAD', 'SSLCOMMERZ', 'BANK_TRANSFER']).default('COD'),
  items: z.array(checkoutItemSchema).min(1, 'Your shopping cart is empty'),
  customerId: z.string().optional(),
  createAccount: z.boolean().optional(),
  accountPassword: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// Customer Authentication Schemas
export const customerRegisterSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    phone: z.string().regex(bdPhoneRegex, 'Please enter a valid Bangladesh phone number (e.g. 01753765372)'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
    acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms and conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;

export const customerLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;

export const customerProfileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().regex(bdPhoneRegex, 'Please enter a valid Bangladesh phone number (e.g. 01753765372)'),
  email: z.string().email('Please enter a valid email address').optional(),
});

export type CustomerProfileUpdateInput = z.infer<typeof customerProfileUpdateSchema>;

export const customerAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  phone: z.string().regex(bdPhoneRegex, 'Please enter a valid Bangladesh phone number (e.g. 01753765372)'),
  address: z.string().min(5, 'Full street address is required').max(300),
  area: z.string().min(2, 'Area or Upazila is required').max(100),
  city: z.string().min(2, 'City is required').max(100),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  deliveryInstructions: z.string().max(300).optional().or(z.literal('')),
  isDefault: z.boolean().optional().default(false),
});

export type CustomerAddressInput = z.infer<typeof customerAddressSchema>;

export const customerPasswordResetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type CustomerPasswordResetRequestInput = z.infer<typeof customerPasswordResetRequestSchema>;

export const customerPasswordUpdateSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type CustomerPasswordUpdateInput = z.infer<typeof customerPasswordUpdateSchema>;

// Banner Schemas
export const bannerSchema = z.object({
  title: z.string().min(2, 'Banner title is required').max(150),
  subtitle: z.string().max(250).optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  desktopImageUrl: z.string().min(1, 'Desktop banner image is required'),
  mobileImageUrl: z.string().optional().or(z.literal('')),
  buttonText: z.string().default('Shop Now'),
  buttonUrl: z.string().optional().or(z.literal('')),
  type: z.enum(['PROMOTIONAL', 'PRODUCT', 'CATEGORY', 'ANNOUNCEMENT', 'SEASONAL']).default('PROMOTIONAL'),
  priority: z.number().int().default(0),
  startAt: z.string().optional().nullable().or(z.literal('')),
  endAt: z.string().optional().nullable().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export type BannerInput = z.infer<typeof bannerSchema>;

// Offer Schemas
export const offerSchema = z.object({
  title: z.string().min(2, 'Offer title is required').max(150),
  description: z.string().max(500).optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal('')),
  badge: z.string().max(50).optional().or(z.literal('')),
  discountType: z.enum(['PERCENTAGE', 'FIXED', 'PROMOTIONAL_ONLY']).default('PROMOTIONAL_ONLY'),
  discountValue: z.number().min(0).optional().nullable(),
  productId: z.string().optional().nullable().or(z.literal('')),
  categoryId: z.string().optional().nullable().or(z.literal('')),
  buttonText: z.string().default('View Offer'),
  buttonUrl: z.string().optional().or(z.literal('')),
  priority: z.number().int().default(0),
  startAt: z.string().optional().nullable().or(z.literal('')),
  endAt: z.string().optional().nullable().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export type OfferInput = z.infer<typeof offerSchema>;

// Homepage Section Schemas
export const homepageSectionSchema = z.object({
  title: z.string().min(2, 'Section title is required'),
  subtitle: z.string().optional().or(z.literal('')),
  sortOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
});

export type HomepageSectionInput = z.infer<typeof homepageSectionSchema>;

export const orderStatusUpdateSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']),
  note: z.string().optional(),
});

export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  type: z.enum(['INITIAL', 'RECEIVE', 'SALE', 'RETURN', 'ADJUSTMENT', 'RESERVATION_RELEASE']),
  quantity: z.number().int().refine((val) => val !== 0, 'Quantity adjustment cannot be 0'),
  reason: z.string().min(3, 'A clear reason for stock adjustment is required'),
  referenceId: z.string().optional(),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;

export const orderTrackingSchema = z.object({
  orderNumber: z.string().min(5, 'Order number is required (e.g. TC-2026-XXXX)'),
  phone: z.string().regex(bdPhoneRegex, 'Phone number must match the order contact number'),
});

export type OrderTrackingInput = z.infer<typeof orderTrackingSchema>;

export const siteSettingsSchema = z.object({
  storeName: z.string().min(2),
  ownerName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  address: z.string().min(5),
  facebookUrl: z.string().url(),
  whatsappNumber: z.string().min(6),
  storeDescription: z.string().min(5),
  deliveryFeeInsideMoulvibazar: z.number().min(0),
  deliveryFeeOutsideMoulvibazar: z.number().min(0),
  freeDeliveryThreshold: z.number().positive().optional().nullable(),
  isMaintenanceMode: z.boolean().default(false),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
