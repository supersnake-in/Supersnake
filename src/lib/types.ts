export type Gender = 'men' | 'women' | 'unisex';

export type FitType = 'Oversized' | 'Relaxed' | 'Boxy' | 'Classic' | 'Slim';

export type Size = 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL' | '5XL' | '6XL';

export const SIZE_ORDER: Record<string, number> = {
  XXS: 1,
  '2XS': 1,
  XS: 2,
  S: 3,
  M: 4,
  L: 5,
  XL: 6,
  XXL: 7,
  '2XL': 7,
  XXXL: 8,
  '3XL': 8,
  XXXXL: 9,
  '4XL': 9,
  XXXXXL: 10,
  '5XL': 10,
  XXXXXXL: 11,
  '6XL': 11,
};

export function sortSizes<T extends string>(sizes: T[]): T[] {
  if (!Array.isArray(sizes)) return [];
  return [...sizes].sort((a, b) => {
    const keyA = (a || '').toUpperCase().trim();
    const keyB = (b || '').toUpperCase().trim();
    const orderA = SIZE_ORDER[keyA] ?? 99;
    const orderB = SIZE_ORDER[keyB] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });
}

export interface ProductVariant {
  id: string;
  sku: string;
  colorName: string;
  colorHex: string;
  size: Size;
  stock: number;
  price: number;
  mrp: number;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
  angle?: 'front' | 'back' | 'detail' | 'model' | 'fabric' | 'studio' | 'side';
}

export interface HomepageConfig {
  heroImages: string[];
  heroIntervalSeconds: number;
  heroHeadline: string;
  heroSupportingCopy: string;
  spotlightProductId: string;
  brandStatement: string;
  menCollectionImage?: string;
  womenCollectionImage?: string;
  supersnakeTeeImage?: string;
  signatureTeeImage?: string;
  pillar1Image?: string;
  pillar2Image?: string;
  pillar3Image?: string;
  heroObjectEyebrow?: string;
  heroObjectTitle?: string;
  heroObjectQuote?: string;
  heroObjectBadge?: string;
  heroObjectSpec1Eyebrow?: string;
  heroObjectSpec1Title?: string;
  heroObjectSpec1Desc?: string;
  heroObjectSpec2Eyebrow?: string;
  heroObjectSpec2Title?: string;
  heroObjectSpec2Desc?: string;
  heroObjectSpec3Eyebrow?: string;
  heroObjectSpec3Title?: string;
  heroObjectSpec3Desc?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  gender: Gender;
  fit: FitType;
  price: number;
  mrp: number;
  gsm?: number;
  fabric: string;
  weightText?: string;
  careInstructions: string[];
  features: string[];
  shippingPolicy?: string;
  images: ProductImage[];
  colors: { name: string; hex: string }[];
  sizes: Size[];
  variants: ProductVariant[];
  isNew?: boolean;
  isBestseller?: boolean;
  isSpotlight?: boolean;
  isSignature?: boolean;
  preLaunchEnabled?: boolean;
  maxPreBookings?: number;
  collectionId?: string;
  collectionSlug?: string;
  collectionName?: string;
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedColor: { name: string; hex: string };
  selectedSize: Size;
  quantity: number;
  price: number;
}

export interface WishlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

export type OrderStatus =
  | 'Payment Pending'
  | 'Payment Failed'
  | 'Paid'
  | 'Verification Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned'
  | 'Refunded';

export interface Address {
  id?: string;
  fullName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  postOffice?: string;
  district?: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  color: string;
  size: Size;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  customerId?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: Address;
  payment: {
    method: 'razorpay' | 'upi' | 'card';
    transactionId: string;
    status: 'paid' | 'pending' | 'failed';
    paidAt?: string;
  };
  verificationStatus?: 'Pending' | 'Verified' | 'Unverified' | 'Unreachable';
  verifiedAt?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  phoneVerified?: boolean;
  couponCode?: string;
  tracking?: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery?: string;
    updates?: { status: string; timestamp: string; location: string }[];
  };
}

export interface Coupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderAmount: number;
  description: string;
}

export interface AdminKPIs {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  customers: number;
  customersChange: number;
  unitsSold: number;
  aov: number;
}

export interface SocialConfig {
  communityImages: string[];
  instagram: string;
  x: string;
  youtube: string;
  threads: string;
  linkedin: string;
  contactPhone: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
  source?: string;
}

export type DefectStatus =
  | 'Pending Review'
  | 'Under Investigation'
  | 'Approved'
  | 'Rejected'
  | 'Resolved';

export interface DefectReport {
  id: string;
  reportNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productId?: string;
  productName: string;
  productColor?: string;
  productSize?: string;
  productImage?: string;
  defectType: string;
  description: string;
  images: string[];
  videoUrl?: string;
  status: DefectStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type AbandonedCartStatus = 'Active' | 'Abandoned' | 'Contacted' | 'Recovered';

export interface AbandonedCartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  colorName: string;
  colorHex?: string;
  size: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface AbandonedCart {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: AbandonedCartItem[];
  subtotal: number;
  itemCount: number;
  status: AbandonedCartStatus;
  notes?: string;
  discountOffered?: string;
  lastActiveAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MaintenanceConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  estimatedRestoreTime: string | null;
  updatedAt: string;
  updatedBy: string;
}

export type StorefrontMode = 'PRE_LAUNCH' | 'LIVE' | 'MAINTENANCE';

export interface StorefrontConfig {
  id: string;
  storefrontMode: StorefrontMode;
  launchDate: string; // e.g. "2026-10-14"
  launchTime: string; // e.g. "10:00"
  launchTimezone: string; // e.g. "IST"
  automaticLaunch: boolean;
  preLaunchProductLimit: number;
  maintenanceMessage: string;
  estimatedRestoreTime: string | null;
  snowEffectEnabled?: boolean;
  freeShippingThreshold?: number;
  updatedAt: string;
  updatedBy: string;
}

export type PreBookingStatus =
  | 'CONFIRMED'
  | 'PRODUCTION'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CONTACTED'
  | 'CONVERTED_TO_ORDER'
  | 'CANCELLED';

export interface PreBooking {
  id: string;
  bookingNumber: string;
  referenceCode: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  streetAddress?: string;
  city: string;
  state: string;
  pincode: string;
  postOffice?: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  colorName: string;
  colorHex?: string;
  size: string;
  quantity: number;
  unitPrice: number;
  productPrice: number;
  totalAmount: number;
  totalPrice: number;
  paymentStatus: 'Paid' | 'Pending' | 'Reservation' | 'Pending (COD)';
  paymentMethod?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  paidAt?: string;
  bookingStatus: PreBookingStatus;
  status: PreBookingStatus;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    postOffice?: string;
    country?: string;
  };
  adminNotes?: string;
  carrierName?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionColor {
  name: string;
  hex: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  badge: string;
  artworkMood?: string;
  fabricSpecs?: string;
  heroImage: string;
  cardImage?: string;
  moodPalette: CollectionColor[];
  displayOrder: number;
  isActive: boolean;
  isFeatured?: boolean;
  accentColor?: string;
  createdAt: string;
  updatedAt?: string;
}

// =========================================================================
// ANNOUNCEMENT BAR SYSTEM
// =========================================================================

export type AnnouncementStatus = 'disabled' | 'active' | 'scheduled' | 'expired';

export interface AnnouncementConfig {
  id: string; // 'default'
  isEnabled: boolean;
  message: string;
  destinationUrl?: string | null;
  ctaLabel?: string | null;
  bgColor: string; // default '#111111'
  textColor: string; // default '#EDEDED'
  accentColor?: string | null; // default '#04fc21'
  startTime?: string | null; // ISO 8601 string in UTC
  endTime?: string | null; // ISO 8601 string in UTC
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Validates whether an announcement is eligible to be shown right now.
 */
export function isAnnouncementActive(config?: AnnouncementConfig | null): boolean {
  if (!config || !config.isEnabled) return false;
  if (!config.message || !config.message.trim()) return false;

  const now = Date.now();
  if (config.startTime) {
    const startMs = new Date(config.startTime).getTime();
    if (!isNaN(startMs) && now < startMs) {
      return false; // Scheduled in future
    }
  }

  if (config.endTime) {
    const endMs = new Date(config.endTime).getTime();
    if (!isNaN(endMs) && now > endMs) {
      return false; // Expired
    }
  }

  return true;
}

/**
 * Calculates current publication status for administrator display.
 */
export function getAnnouncementStatus(config?: AnnouncementConfig | null): {
  status: AnnouncementStatus;
  label: string;
} {
  if (!config || !config.isEnabled) {
    return { status: 'disabled', label: 'DISABLED' };
  }
  if (!config.message?.trim()) {
    return { status: 'disabled', label: 'DISABLED (NO MESSAGE)' };
  }

  const now = Date.now();
  if (config.startTime) {
    const startMs = new Date(config.startTime).getTime();
    if (!isNaN(startMs) && now < startMs) {
      return { status: 'scheduled', label: 'SCHEDULED (UPCOMING)' };
    }
  }

  if (config.endTime) {
    const endMs = new Date(config.endTime).getTime();
    if (!isNaN(endMs) && now > endMs) {
      return { status: 'expired', label: 'EXPIRED' };
    }
  }

  return { status: 'active', label: 'PUBLISHED (LIVE)' };
}

/**
 * Validates a destination URL against security rules (prevents open redirects & XSS).
 * Strictly allows internal relative paths (/...) and secure https:// links.
 */
export function isValidAnnouncementUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim();
  if (!clean) return false;

  // Reject dangerous protocols
  const lower = clean.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }

  // Allow relative internal paths, rejecting protocol-relative '//'
  if (clean.startsWith('/')) {
    if (clean.startsWith('//')) return false;
    // Reject whitespace or invalid URL path characters
    return !/[\s\\<>]/.test(clean);
  }

  // Allow explicit secure HTTPS URLs
  if (clean.startsWith('https://')) {
    try {
      const parsed = new URL(clean);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Validates 3-char or 6-char hex color codes (e.g. #111111, #04fc21).
 */
export function isValidHexColor(color?: string | null): boolean {
  if (!color || typeof color !== 'string') return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color.trim());
}

/**
 * Sanitizes announcement copy (strips HTML tags and limits to 160 chars).
 */
export function sanitizeAnnouncementMessage(msg: string): string {
  if (!msg || typeof msg !== 'string') return '';
  return msg
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/\s+/g, ' ') // Collapse multiple whitespace
    .trim()
    .slice(0, 160);
}
