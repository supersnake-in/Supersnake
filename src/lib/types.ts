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
  angle?: 'front' | 'back' | 'detail' | 'model' | 'fabric';
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
  careInstructions: string[];
  features: string[];
  images: ProductImage[];
  colors: { name: string; hex: string }[];
  sizes: Size[];
  variants: ProductVariant[];
  isNew?: boolean;
  isBestseller?: boolean;
  isSpotlight?: boolean;
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
  | 'Pending'
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
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: Address;
  payment: {
    method: 'razorpay' | 'upi' | 'card' | 'cod';
    transactionId: string;
    status: 'paid' | 'pending' | 'failed';
    paidAt?: string;
  };
  tracking?: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery: string;
    updates: { status: string; timestamp: string; location: string }[];
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
