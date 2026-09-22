export type Gender = 'men' | 'women' | 'unisex';

export type FitType = 'Oversized' | 'Relaxed' | 'Boxy' | 'Classic' | 'Slim';

export type Size = 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | '4XL' | '5XL' | '6XL';

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
  gsm: number;
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

