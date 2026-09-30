'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Product,
  CartItem,
  WishlistItem,
  Size,
  Order,
  SocialConfig,
  NewsletterSubscriber,
  DefectReport,
  DefectStatus,
  AbandonedCart,
  AbandonedCartItem,
  AbandonedCartStatus,
  MaintenanceConfig,
  StorefrontMode,
  StorefrontConfig,
  PreBooking,
  PreBookingStatus,
} from './types';
import {
  fetchProductsFromSupabase,
  createProductInSupabase,
  updateProductInSupabase,
  deleteProductFromSupabase,
  setSignatureProductInSupabase,
  createOrderInSupabase,
  fetchOrdersFromSupabase,
  fetchHomepageConfigFromSupabase,
  saveHomepageConfigToSupabase,
  fetchSubscribersFromSupabase,
  deleteSubscriberFromSupabase,
  subscribeNewsletterInSupabase,
  fetchSocialConfigFromSupabase,
  saveSocialConfigToSupabase,
  createDefectReportInSupabase,
  fetchDefectReportsFromSupabase,
  updateDefectReportInSupabase,
  updateOrderInSupabase,
  syncAbandonedCartToSupabase,
  fetchAbandonedCartsFromSupabase,
  updateAbandonedCartStatusInSupabase,
  markCartAsRecoveredInSupabase,
  fetchMaintenanceConfigFromSupabase,
  updateMaintenanceConfigInSupabase,
  fetchStorefrontConfigFromSupabase,
  updateStorefrontConfigInSupabase,
  toggleProductPreLaunchInSupabase,
  fetchPreBookingsFromSupabase,
  createPreBookingInSupabase,
  updatePreBookingInSupabase,
} from './supabase/db';
import {
  saveCartToStorage,
  loadCartFromStorageSync,
  loadCartFromStorageAsync,
  sanitizeCartItem,
} from './storage-helper';
import { BRAND } from './design-tokens';
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

export const STOCK_HERO_IMAGE_SNIPPETS = [
  'photo-1503342217505',
  'photo-1521572267360',
  'photo-1576566588028',
  'photo-1583743814966',
  'photo-1602810318383',
  'photo-1618354691373',
  'photo-1515886657613',
  'photo-1509631179647',
  'photo-1503342394128',
];

export function cleanHeroImages(images?: string[]): string[] {
  if (!images || !Array.isArray(images) || images.length === 0) return ['/hero2.png'];
  const filtered = images.filter(
    (url) => url && typeof url === 'string' && !STOCK_HERO_IMAGE_SNIPPETS.some((stock) => url.includes(stock))
  );
  return filtered.length > 0 ? filtered : ['/hero2.png'];
}

export function cleanCollectionImage(url?: string, defaultFallback: string = ''): string {
  if (!url || typeof url !== 'string') return defaultFallback;
  if (STOCK_HERO_IMAGE_SNIPPETS.some((stock) => url.includes(stock))) {
    return defaultFallback;
  }
  return url;
}

export function cleanCommunityImages(images?: string[]): string[] {
  const fallback = [
    '/community-supersnake.png',
    '/community-supersnake.png',
    '/community-supersnake.png',
    '/community-supersnake.png',
  ];
  if (!images || !Array.isArray(images) || images.length === 0) return fallback;
  const cleaned = images.map((url) => {
    if (!url || typeof url !== 'string') return '/community-supersnake.png';
    if (STOCK_HERO_IMAGE_SNIPPETS.some((stock) => url.includes(stock))) {
      return '/community-supersnake.png';
    }
    return url;
  });
  return cleaned.length > 0 ? cleaned : fallback;
}

export function cleanProductImage(url?: string): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  if (url === '/product-fallback.png') return '';
  if (STOCK_HERO_IMAGE_SNIPPETS.some((stock) => url.includes(stock))) {
    return '';
  }
  return url;
}

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  heroImages: ['/hero2.png'],
  heroIntervalSeconds: 3,
  heroHeadline: 'WEAR YOUR INSTINCT.',
  heroSupportingCopy: 'Premium T-shirts. Designed for your everyday. Engineered for presence.',
  spotlightProductId: 'the-signature-tee',
  brandStatement: 'NOT MADE TO BLEND IN.',
  menCollectionImage: '/men-collection.png',
  womenCollectionImage: '/women-collection.png',
  supersnakeTeeImage: '/hero-object-supersnake-tee.png',
  signatureTeeImage: '/signature-tee-spotlight.png',
  pillar1Image: '/brand-pillar-fabric.png',
  pillar2Image: '/brand-pillar-fit.png',
  pillar3Image: '/brand-pillar-finish.png',
  heroObjectEyebrow: 'THE HERO OBJECT',
  heroObjectTitle: 'THE SUPERSNAKE TEE',
  heroObjectQuote: '“Designed around the everyday. Built around you.”',
  heroObjectBadge: 'ARCHITECTURAL BOXY FIT',
  heroObjectSpec1Eyebrow: '01 / WEIGHT & STABILITY',
  heroObjectSpec1Title: '280 GSM SUPIMA® COTTON',
  heroObjectSpec1Desc: 'Long-staple fibers combed to perfection. Substantial architectural drape that holds its form all day without feeling stiff.',
  heroObjectSpec2Eyebrow: '02 / STRUCTURAL INTEGRITY',
  heroObjectSpec2Title: 'ZERO-SAG 1-INCH COLLAR',
  heroObjectSpec2Desc: 'Twin-needle reinforced collar band with internal cotton herringbone tape. Retains razor-sharp neck tension through 100+ washes.',
  heroObjectSpec3Eyebrow: '03 / ATELIER FINISH',
  heroObjectSpec3Title: 'BLIND-STITCHED HEMS',
  heroObjectSpec3Desc: 'Seamless Japanese blind-hem technique for an uninterrupted silhouette. No curling, no puckering, zero exterior stitch noise.',
};

export const DEFAULT_SOCIAL_CONFIG: SocialConfig = {
  communityImages: [
    '/community-supersnake.png',
    '/community-supersnake.png',
    '/community-supersnake.png',
    '/community-supersnake.png',
  ],
  instagram: 'https://instagram.com/supersnake.in',
  x: 'https://x.com/supersnake_in',
  youtube: 'https://youtube.com/@supersnake_in',
  threads: 'https://threads.net/@supersnake.in',
  linkedin: 'https://linkedin.com/company/supersnake-in',
  contactPhone: '+91 98765 43210',
};

export const DEFAULT_MAINTENANCE_CONFIG: MaintenanceConfig = {
  maintenanceMode: false,
  maintenanceMessage:
    'We are calibrating the atelier for our next heavyweight drop. The portal will resume normal operations shortly.',
  estimatedRestoreTime: null,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

export const DEFAULT_STOREFRONT_CONFIG: StorefrontConfig = {
  id: 'default',
  storefrontMode: 'PRE_LAUNCH',
  launchDate: '2026-10-14',
  launchTime: '10:00',
  launchTimezone: 'IST',
  automaticLaunch: false,
  preLaunchProductLimit: 6,
  maintenanceMessage:
    'We are calibrating the atelier for our next heavyweight drop. The portal will resume normal operations shortly.',
  estimatedRestoreTime: null,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

/**
 * Normalizes a list of products so that strictly EXACTLY ONE product has `isSignature = true`.
 * If multiple have isSignature: true, preserves 'the-signature-tee' if it's one of them, otherwise the first one.
 * If none has isSignature: true, designates 'the-signature-tee' (or the first product if not found).
 */
function normalizeSignatureProduct(prods: Product[]): Product[] {
  if (!prods || prods.length === 0) return [];

  const sigIndices = prods
    .map((p, i) => (p.isSignature ? i : -1))
    .filter((i) => i !== -1);

  let activeIndex = -1;
  if (sigIndices.length > 0) {
    const prefIndex = prods.findIndex((p) => p.slug === 'the-signature-tee' && p.isSignature);
    if (prefIndex !== -1) {
      activeIndex = prefIndex;
    } else {
      activeIndex = sigIndices[0];
    }
  } else {
    const prefIndex = prods.findIndex((p) => p.slug === 'the-signature-tee');
    activeIndex = prefIndex !== -1 ? prefIndex : 0;
  }

  return prods.map((p, idx) => ({
    ...p,
    isSignature: idx === activeIndex,
  }));
}

export function saveDefectReportsToStorage(reports: DefectReport[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('supersnake_defect_reports', JSON.stringify(reports));
  } catch (quotaError) {
    // Quota exceeded: sanitize heavy media strings so tickets and report dossiers are never lost
    try {
      const sanitized = reports.map((r) => ({
        ...r,
        videoUrl: r.videoUrl && r.videoUrl.length > 200000 ? '[VIDEO_ATTACHED]' : r.videoUrl,
        images: Array.isArray(r.images)
          ? r.images.map((img) => (img && img.length > 200000 ? img.slice(0, 50000) + '...' : img))
          : [],
      }));
      localStorage.setItem('supersnake_defect_reports', JSON.stringify(sanitized));
    } catch (e) {
      console.warn('Could not persist defect reports to localStorage:', e);
    }
  }
}

export function saveAbandonedCartsToStorage(carts: AbandonedCart[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('supersnake_abandoned_carts', JSON.stringify(carts));
  } catch (e) {
    console.warn('Could not persist abandoned carts to localStorage:', e);
  }
}

interface StoreContextType {
  isLoaded: boolean;

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size: Size, color: { name: string; hex: string }, quantity?: number) => void;
  setCartItem: (product: Product, size: Size, color: { name: string; hex: string }, quantity?: number) => void;
  setCart: (cart: CartItem[]) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Wishlist
  wishlist: WishlistItem[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;

  // Quick View
  quickViewProduct: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;

  // Search Modal
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // Orders
  orders: Order[];
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  getOrderById: (orderId: string) => Order | undefined;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<boolean>;

  // Products Catalog (Admin & Storefront synchronized)
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  setSignatureProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
  getProductBySlug: (slug: string) => Product | undefined;

  // Homepage Configuration
  homepageConfig: HomepageConfig;
  updateHomepageConfig: (config: Partial<HomepageConfig>) => Promise<boolean>;

  // Social Configuration & Community Showcase
  socialConfig: SocialConfig;
  updateSocialConfig: (config: Partial<SocialConfig>) => Promise<boolean>;

  // Membership & Newsletter Subscribers
  subscribers: NewsletterSubscriber[];
  addSubscriber: (email: string) => Promise<boolean>;
  deleteSubscriber: (id: string) => Promise<boolean>;

  // Store Settings & Logistics
  freeShippingThreshold: number;
  updateFreeShippingThreshold: (threshold: number) => void;

  // Defect Reports
  defectReports: DefectReport[];
  submitDefectReport: (report: Omit<DefectReport, 'id' | 'reportNumber' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<DefectReport>;
  updateDefectReportStatus: (id: string, status: DefectStatus, notes?: string) => Promise<boolean>;
  refreshDefectReports: () => Promise<DefectReport[]>;

  // Abandoned & Active Carts
  abandonedCarts: AbandonedCart[];
  syncAbandonedCart: (customerInfo?: { email: string; name?: string; phone?: string; userId?: string }) => Promise<void>;
  updateAbandonedCartStatus: (cartId: string, status: AbandonedCartStatus, notes?: string, discountOffered?: string) => Promise<boolean>;
  refreshAbandonedCarts: () => Promise<AbandonedCart[]>;

  // Global Maintenance Mode
  maintenanceConfig: MaintenanceConfig;
  updateMaintenanceConfig: (updates: Partial<MaintenanceConfig>, adminEmail?: string) => Promise<{ success: boolean; error?: string }>;
  refreshMaintenanceConfig: () => Promise<MaintenanceConfig>;

  // Storefront Mode & Pre-Launch
  storefrontConfig: StorefrontConfig;
  updateStorefrontConfig: (updates: Partial<StorefrontConfig>, adminEmail?: string) => Promise<{ success: boolean; error?: string }>;
  refreshStorefrontConfig: () => Promise<StorefrontConfig>;
  toggleProductPreLaunch: (productId: string, enabled: boolean) => Promise<{ success: boolean; error?: string }>;

  // Pre-Bookings
  preBookings: PreBooking[];
  createPreBooking: (booking: Omit<PreBooking, 'id' | 'bookingNumber' | 'createdAt' | 'updatedAt' | 'bookingStatus'>) => Promise<PreBooking>;
  updatePreBookingStatus: (id: string, bookingStatus: PreBookingStatus, notes?: string, paymentStatus?: 'Paid' | 'Pending' | 'Reservation') => Promise<boolean>;
  refreshPreBookings: () => Promise<PreBooking[]>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(DEFAULT_HOMEPAGE_CONFIG);
  const [socialConfig, setSocialConfig] = useState<SocialConfig>(DEFAULT_SOCIAL_CONFIG);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [defectReports, setDefectReports] = useState<DefectReport[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig>(DEFAULT_MAINTENANCE_CONFIG);
  const [storefrontConfig, setStorefrontConfig] = useState<StorefrontConfig>(DEFAULT_STOREFRONT_CONFIG);
  const [preBookings, setPreBookings] = useState<PreBooking[]>([]);
  const [freeShippingThreshold, setFreeShippingThresholdState] = useState<number>(BRAND.freeShippingThreshold);
  const [isLoaded, setIsLoaded] = useState(false);

  const updateFreeShippingThreshold = (threshold: number) => {
    const valid = Number(threshold) > 0 ? Number(threshold) : BRAND.freeShippingThreshold;
    setFreeShippingThresholdState(valid);
    try {
      localStorage.setItem('supersnake_free_shipping_threshold', String(valid));
      window.dispatchEvent(new Event('supersnake_threshold_change'));
    } catch (e) {}
  };

  // Sync from localStorage & Supabase
  useEffect(() => {
    try {
      // Purge any legacy mock products from browser storage & deduplicate images
      const savedProducts = localStorage.getItem('supersnake_products');
      if (savedProducts) {
        try {
          const parsed = JSON.parse(savedProducts);
          if (Array.isArray(parsed)) {
            const realProducts = parsed
              .filter((p) => !p.id?.startsWith('prod-0'))
              .map((p) => {
                const seen = new Set<string>();
                return {
                  ...p,
                  images: Array.isArray(p.images)
                    ? p.images
                        .map((img: any) => ({
                          ...img,
                          url: cleanProductImage(img?.url),
                        }))
                        .filter((img: any) => {
                          if (!img?.url || seen.has(img.url)) return false;
                          seen.add(img.url);
                          return true;
                        })
                    : [],
                };
              });
            const normalized = normalizeSignatureProduct(realProducts);
            setProducts(normalized);
            saveProductsToLocalStorage(normalized);
          }
        } catch (e) {}
      }

      const syncCart = loadCartFromStorageSync();
      if (syncCart.length > 0) {
        setCart(syncCart);
        setIsLoaded(true);
      } else {
        loadCartFromStorageAsync()
          .then((asyncCart) => {
            if (asyncCart.length > 0) {
              setCart(asyncCart);
            }
            setIsLoaded(true);
          })
          .catch(() => {
            setIsLoaded(true);
          });
      }

      const savedWishlist = localStorage.getItem('supersnake_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      // Purge any legacy mock orders from browser storage
      const savedOrders = localStorage.getItem('supersnake_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) {
          const realOrders = parsed.filter(
            (o) =>
              o.id !== 'ord-8891' &&
              o.orderNumber !== 'SS-2026-8891' &&
              o.customer?.email !== 'aditya.sharma@example.com'
          );
          setOrders(realOrders);
          localStorage.setItem('supersnake_orders', JSON.stringify(realOrders));
        }
      }

      // Defect reports from browser storage
      const savedDefects = localStorage.getItem('supersnake_defect_reports');
      if (savedDefects) {
        try {
          const parsedDefects = JSON.parse(savedDefects);
          if (Array.isArray(parsedDefects)) {
            setDefectReports(parsedDefects);
          }
        } catch (e) {}
      }

      // Abandoned carts from browser storage
      const savedAbandoned = localStorage.getItem('supersnake_abandoned_carts');
      if (savedAbandoned) {
        try {
          const parsedAbandoned = JSON.parse(savedAbandoned);
          if (Array.isArray(parsedAbandoned)) {
            setAbandonedCarts(parsedAbandoned);
          }
        } catch (e) {}
      }

      // Homepage configuration
      const savedHomepage = localStorage.getItem('supersnake_homepage_config');
      if (savedHomepage) {
        try {
          const parsed = JSON.parse(savedHomepage);
          if (parsed) {
            if (Array.isArray(parsed.heroImages)) {
              parsed.heroImages = cleanHeroImages(parsed.heroImages);
            }
            if (parsed.menCollectionImage) {
              parsed.menCollectionImage = cleanCollectionImage(parsed.menCollectionImage, '/men-collection.png');
            }
            if (parsed.womenCollectionImage) {
              parsed.womenCollectionImage = cleanCollectionImage(parsed.womenCollectionImage, '/women-collection.png');
            }
            if (parsed.signatureTeeImage) {
              parsed.signatureTeeImage = cleanCollectionImage(parsed.signatureTeeImage, '/signature-tee-spotlight.png');
            }
            if (parsed.supersnakeTeeImage) {
              parsed.supersnakeTeeImage = cleanCollectionImage(parsed.supersnakeTeeImage, '/hero-object-supersnake-tee.png');
            }
            if (parsed.pillar1Image) {
              parsed.pillar1Image = cleanCollectionImage(parsed.pillar1Image, '/brand-pillar-fabric.png');
            }
            if (parsed.pillar2Image) {
              parsed.pillar2Image = cleanCollectionImage(parsed.pillar2Image, '/brand-pillar-fit.png');
            }
            if (parsed.pillar3Image) {
              parsed.pillar3Image = cleanCollectionImage(parsed.pillar3Image, '/brand-pillar-finish.png');
            }
            setHomepageConfig((prev) => ({ ...prev, ...parsed }));
          }
        } catch (e) {}
      }

      // Social configuration
      const savedSocial = localStorage.getItem('supersnake_social_config');
      if (savedSocial) {
        try {
          const parsed = JSON.parse(savedSocial);
          if (parsed) {
            if (Array.isArray(parsed.communityImages)) {
              parsed.communityImages = cleanCommunityImages(parsed.communityImages);
            }
            setSocialConfig((prev) => ({ ...prev, ...parsed }));
          }
        } catch (e) {}
      }

      // Newsletter subscribers
      const savedSubscribers = localStorage.getItem('supersnake_newsletter_subscribers');
      if (savedSubscribers) {
        try {
          const parsed = JSON.parse(savedSubscribers);
          if (Array.isArray(parsed)) setSubscribers(parsed);
        } catch (e) {}
      }

      // Maintenance configuration from browser storage
      const savedMaintenance = localStorage.getItem('supersnake_maintenance_config');
      if (savedMaintenance) {
        try {
          const parsedMaintenance = JSON.parse(savedMaintenance);
          if (parsedMaintenance && typeof parsedMaintenance.maintenanceMode === 'boolean') {
            setMaintenanceConfig(parsedMaintenance);
          }
        } catch (e) {}
      }

      // Storefront configuration from browser storage
      const savedStorefront = localStorage.getItem('supersnake_storefront_config');
      if (savedStorefront) {
        try {
          const parsedSf = JSON.parse(savedStorefront);
          if (parsedSf && parsedSf.storefrontMode) {
            setStorefrontConfig((prev) => ({ ...prev, ...parsedSf }));
          }
        } catch (e) {}
      }

      // Pre-bookings from browser storage
      const savedPreBookings = localStorage.getItem('supersnake_pre_bookings');
      if (savedPreBookings) {
        try {
          const parsedPb = JSON.parse(savedPreBookings);
          if (Array.isArray(parsedPb)) {
            setPreBookings(parsedPb);
          }
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Failed to load storage:', e);
      setIsLoaded(true);
    }

    // Fetch dynamic products from Supabase (Single Source of Truth)
    fetchProductsFromSupabase()
      .then((supabaseProducts) => {
        if (supabaseProducts !== null) {
          const deduplicated = supabaseProducts.map((p) => {
            const seen = new Set<string>();
            return {
              ...p,
              images: (p.images || [])
                .map((img) => ({
                  ...img,
                  url: cleanProductImage(img?.url),
                }))
                .filter((img) => {
                  if (!img?.url || seen.has(img.url)) return false;
                  seen.add(img.url);
                  return true;
                }),
            };
          });
          const normalized = normalizeSignatureProduct(deduplicated);
          setProducts(normalized);
          saveProductsToLocalStorage(normalized);
        }
      })
      .catch((err) => {
        console.warn('Supabase fetch failed:', err);
      });

    // Fetch dynamic orders from Supabase (Single Source of Truth)
    fetchOrdersFromSupabase()
      .then((supabaseOrders) => {
        if (supabaseOrders !== null) {
          setOrders((prev) => {
            const map = new Map<string, Order>();
            // Add Supabase orders
            supabaseOrders.forEach((o) => {
              map.set(o.orderNumber, o);
            });
            // Keep locally created orders that aren't in Supabase yet
            prev.forEach((o) => {
              if (!map.has(o.orderNumber)) {
                map.set(o.orderNumber, o);
              }
            });
            const merged = Array.from(map.values());
            try {
              localStorage.setItem('supersnake_orders', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      })
      .catch((err) => {
        console.warn('Supabase orders fetch failed:', err);
      });

    // Fetch dynamic homepage config from Supabase
    fetchHomepageConfigFromSupabase()
      .then((supabaseHomepage) => {
        if (supabaseHomepage !== null) {
          const cleaned = {
            ...supabaseHomepage,
            heroImages: cleanHeroImages(supabaseHomepage.heroImages),
            menCollectionImage: cleanCollectionImage(supabaseHomepage.menCollectionImage, '/men-collection.png'),
            womenCollectionImage: cleanCollectionImage(supabaseHomepage.womenCollectionImage, '/women-collection.png'),
            signatureTeeImage: cleanCollectionImage(supabaseHomepage.signatureTeeImage, '/signature-tee-spotlight.png'),
            supersnakeTeeImage: cleanCollectionImage(supabaseHomepage.supersnakeTeeImage, '/hero-object-supersnake-tee.png'),
            pillar1Image: cleanCollectionImage(supabaseHomepage.pillar1Image, '/brand-pillar-fabric.png'),
            pillar2Image: cleanCollectionImage(supabaseHomepage.pillar2Image, '/brand-pillar-fit.png'),
            pillar3Image: cleanCollectionImage(supabaseHomepage.pillar3Image, '/brand-pillar-finish.png'),
          };
          setHomepageConfig(cleaned);
          try {
            localStorage.setItem('supersnake_homepage_config', JSON.stringify(cleaned));
          } catch (e) {}
        }
      })
      .catch((err) => {
        console.warn('Supabase homepage config fetch failed:', err);
      });

    // Fetch dynamic social config from Supabase
    fetchSocialConfigFromSupabase()
      .then((supabaseSocial) => {
        if (supabaseSocial !== null) {
          const cleaned = {
            ...supabaseSocial,
            ...(Array.isArray(supabaseSocial.communityImages)
              ? { communityImages: cleanCommunityImages(supabaseSocial.communityImages) }
              : {}),
          };
          setSocialConfig((prev) => ({ ...prev, ...cleaned }));
          try {
            localStorage.setItem('supersnake_social_config', JSON.stringify(cleaned));
          } catch (e) {}
        }
      })
      .catch(() => {});

    // Fetch dynamic subscribers from Supabase
    fetchSubscribersFromSupabase()
      .then((supabaseSubscribers) => {
        if (supabaseSubscribers !== null) {
          setSubscribers(supabaseSubscribers);
          try {
            localStorage.setItem('supersnake_newsletter_subscribers', JSON.stringify(supabaseSubscribers));
          } catch (e) {}
        }
      })
      .catch(() => {});

    // Fetch dynamic defect reports from Supabase
    fetchDefectReportsFromSupabase()
      .then((supabaseDefects) => {
        if (supabaseDefects && supabaseDefects.length > 0) {
          setDefectReports((prev) => {
            const map = new Map<string, DefectReport>();
            supabaseDefects.forEach((d) => map.set(d.id, d));
            prev.forEach((d) => {
              if (!map.has(d.id) && !map.has(d.reportNumber)) {
                map.set(d.id, d);
              }
            });
            const merged = Array.from(map.values());
            saveDefectReportsToStorage(merged);
            return merged;
          });
        }
      })
      .catch(() => {});

    // Fetch dynamic abandoned carts from Supabase
    fetchAbandonedCartsFromSupabase()
      .then((supabaseCarts) => {
        if (supabaseCarts && supabaseCarts.length > 0) {
          setAbandonedCarts((prev) => {
            const map = new Map<string, AbandonedCart>();
            supabaseCarts.forEach((c) => map.set(c.id, c));
            prev.forEach((c) => {
              if (!map.has(c.id)) {
                map.set(c.id, c);
              }
            });
            const merged = Array.from(map.values());
            saveAbandonedCartsToStorage(merged);
            return merged;
          });
        }
      })
      .catch(() => {});

    // Fetch dynamic maintenance config from API (or fallback to Supabase)
    fetch('/api/admin/maintenance')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          const cfg = data.config || data;
          if (cfg && typeof cfg.maintenanceMode === 'boolean') {
            setMaintenanceConfig(cfg);
            try {
              localStorage.setItem('supersnake_maintenance_config', JSON.stringify(cfg));
            } catch (e) {}
            return;
          }
        }
        throw new Error('API maintenance fallback');
      })
      .catch(() => {
        fetchMaintenanceConfigFromSupabase()
          .then((dbConfig) => {
            if (dbConfig) {
              setMaintenanceConfig(dbConfig);
              try {
                localStorage.setItem('supersnake_maintenance_config', JSON.stringify(dbConfig));
              } catch (e) {}
            }
          })
          .catch(() => {});
      });

    // Fetch dynamic storefront configuration from API (or fallback to Supabase)
    fetch('/api/storefront-mode')
      .then(async (res) => {
        if (res.ok) {
          const cfg = await res.json();
          if (cfg && cfg.storefrontMode) {
            setStorefrontConfig(cfg);
            try {
              localStorage.setItem('supersnake_storefront_config', JSON.stringify(cfg));
            } catch (e) {}
            return;
          }
        }
        throw new Error('API storefront mode fallback');
      })
      .catch(() => {
        fetchStorefrontConfigFromSupabase()
          .then((dbConfig) => {
            if (dbConfig) {
              setStorefrontConfig(dbConfig);
              try {
                localStorage.setItem('supersnake_storefront_config', JSON.stringify(dbConfig));
              } catch (e) {}
            }
          })
          .catch(() => {});
      });

    // Fetch dynamic pre-bookings from Supabase
    fetchPreBookingsFromSupabase()
      .then((bookings) => {
        if (bookings && bookings.length > 0) {
          setPreBookings(bookings);
          try {
            localStorage.setItem('supersnake_pre_bookings', JSON.stringify(bookings));
          } catch (e) {}
        }
      })
      .catch(() => {});

    // Free shipping threshold sync from localStorage
    try {
      const savedThreshold = localStorage.getItem('supersnake_free_shipping_threshold');
      if (savedThreshold && !isNaN(Number(savedThreshold)) && Number(savedThreshold) > 0) {
        setFreeShippingThresholdState(Number(savedThreshold));
      }
    } catch (e) {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supersnake_free_shipping_threshold' && e.newValue) {
        const val = Number(e.newValue);
        if (!isNaN(val) && val > 0) {
          setFreeShippingThresholdState(val);
        }
      }
      if (e.key === 'supersnake_defect_reports' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setDefectReports(parsed);
          }
        } catch (err) {}
      }
      if (e.key === 'supersnake_abandoned_carts' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setAbandonedCarts(parsed);
          }
        } catch (err) {}
      }
    };

    const handleCustomChange = () => {
      try {
        const saved = localStorage.getItem('supersnake_free_shipping_threshold');
        if (saved && !isNaN(Number(saved)) && Number(saved) > 0) {
          setFreeShippingThresholdState(Number(saved));
        }
      } catch (e) {}
    };

    const handleDefectsChange = () => {
      try {
        const saved = localStorage.getItem('supersnake_defect_reports');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setDefectReports(parsed);
          }
        }
      } catch (e) {}
    };

    const handleAbandonedChange = () => {
      try {
        const saved = localStorage.getItem('supersnake_abandoned_carts');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setAbandonedCarts(parsed);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('supersnake_threshold_change', handleCustomChange);
    window.addEventListener('supersnake_defects_change', handleDefectsChange);
    window.addEventListener('supersnake_abandoned_change', handleAbandonedChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('supersnake_threshold_change', handleCustomChange);
      window.removeEventListener('supersnake_defects_change', handleDefectsChange);
      window.removeEventListener('supersnake_abandoned_change', handleAbandonedChange);
    };
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('supersnake_social_config', JSON.stringify(socialConfig));
    } catch (e) {}
  }, [socialConfig, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('supersnake_newsletter_subscribers', JSON.stringify(subscribers));
    } catch (e) {}
  }, [subscribers, isLoaded]);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('supersnake_products', JSON.stringify(products));
    } catch (e) {}
  }, [products, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    saveCartToStorage(cart);
  }, [cart, isLoaded]);

  // Heal and rehydrate cart items if any item has missing or empty images
  useEffect(() => {
    if (products.length === 0 || cart.length === 0) return;
    let needsHeal = false;
    const healed = cart.map((item) => {
      const hasImage = item.product?.images && item.product.images.length > 0 && Boolean(item.product.images[0]?.url);
      if (!hasImage) {
        const match = products.find((p) => p.id === item.product?.id || p.slug === item.product?.slug);
        if (match && match.images && match.images.length > 0 && Boolean(match.images[0]?.url)) {
          needsHeal = true;
          return {
            ...item,
            product: {
              ...item.product,
              images: match.images,
            },
          };
        }
      }
      return item;
    });

    if (needsHeal) {
      setCart(healed);
      saveCartToStorage(healed);
    }
  }, [products, cart]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('supersnake_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('supersnake_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('supersnake_homepage_config', JSON.stringify(homepageConfig));
    } catch (e) {}
  }, [homepageConfig, isLoaded]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const setCartState = (newCart: CartItem[]) => {
    saveCartToStorage(newCart);
    setCart(newCart);
  };

  const setCartItem = (
    product: Product,
    size: Size,
    color: { name: string; hex: string },
    quantity: number = 1
  ) => {
    const resolvedProduct =
      product.images && product.images.length > 0 && product.images[0]?.url
        ? product
        : products.find((p) => p.id === product.id || p.slug === product.slug) || product;

    const currentCart = cart.length > 0 ? cart : loadCartFromStorageSync();
    const existingIndex = currentCart.findIndex(
      (item) =>
        (item.product.id === resolvedProduct.id || item.product.slug === resolvedProduct.slug) &&
        item.selectedSize === size &&
        item.selectedColor.name.toLowerCase() === color.name.toLowerCase()
    );

    let next: CartItem[];
    if (existingIndex > -1) {
      next = [...currentCart];
      next[existingIndex] = {
        ...next[existingIndex],
        quantity: Math.max(1, quantity),
        product: resolvedProduct,
      };
    } else {
      const newItem: CartItem = {
        id: `${resolvedProduct.id}-${color.name}-${size}-${Date.now()}`,
        product: resolvedProduct,
        selectedColor: color,
        selectedSize: size,
        quantity: Math.max(1, quantity),
        price: resolvedProduct.price,
      };
      next = [...currentCart, newItem];
    }

    saveCartToStorage(next);
    setCart(next);
  };

  const addToCart = (
    product: Product,
    size: Size,
    color: { name: string; hex: string },
    quantity: number = 1
  ) => {
    // Guarantee product has valid images by checking products catalog if necessary
    const resolvedProduct =
      product.images && product.images.length > 0 && product.images[0]?.url
        ? product
        : products.find((p) => p.id === product.id || p.slug === product.slug) || product;

    // Read directly from storage or memory to guarantee synchronous, fresh state
    const currentCart = cart.length > 0 ? cart : loadCartFromStorageSync();
    const existingIndex = currentCart.findIndex(
      (item) =>
        (item.product.id === resolvedProduct.id || item.product.slug === resolvedProduct.slug) &&
        item.selectedSize === size &&
        item.selectedColor.name.toLowerCase() === color.name.toLowerCase()
    );

    let next: CartItem[];
    if (existingIndex > -1) {
      next = [...currentCart];
      next[existingIndex] = {
        ...next[existingIndex],
        quantity: next[existingIndex].quantity + quantity,
        product: resolvedProduct,
      };
    } else {
      const newItem: CartItem = {
        id: `${resolvedProduct.id}-${color.name}-${size}-${Date.now()}`,
        product: resolvedProduct,
        selectedColor: color,
        selectedSize: size,
        quantity,
        price: resolvedProduct.price,
      };
      next = [...currentCart, newItem];
    }

    saveCartToStorage(next);
    setCart(next);
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    const next = cart.filter((item) => item.id !== itemId);
    saveCartToStorage(next);
    setCart(next);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const next = cart
      .map((item) => {
        if (item.id === itemId) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    saveCartToStorage(next);
    setCart(next);
  };

  const clearCart = useCallback(() => {
    saveCartToStorage([]);
    setCart([]);
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Wishlist
  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.product.id === product.id);
      if (exists) {
        return prev.filter((item) => item.product.id !== product.id);
      }
      return [...prev, { id: `wish-${product.id}`, product, addedAt: new Date().toISOString() }];
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.product.id === productId);
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Quick View
  const openQuickView = (product: Product) => setQuickViewProduct(product);
  const closeQuickView = () => setQuickViewProduct(null);

  // Search
  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...orderData,
      id: `ord-${randomSuffix}`,
      orderNumber: `SS-${new Date().getFullYear()}-${randomSuffix}`,
      createdAt: new Date().toISOString(),
      tracking: {
        carrier: 'SuperSnake Express',
        trackingNumber: `SS-EXP-${randomSuffix}`,
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        updates: [
          {
            status: 'Order Confirmed & Sent to Atelier',
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            location: 'SuperSnake Studio, Bengaluru',
          },
        ],
      },
    };

    setOrders((prev) => {
      const next = [newOrder, ...prev.filter((o) => o.id !== newOrder.id && o.orderNumber !== newOrder.orderNumber)];
      try {
        localStorage.setItem('supersnake_orders', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // Cart will be cleared upon payment completion
    createOrderInSupabase(newOrder).catch((err) => {
      console.warn('Could not sync order to Supabase:', err);
    });

    // Mark abandoned cart as recovered
    if (newOrder.customer?.email) {
      const cleanEmail = newOrder.customer.email.trim().toLowerCase();
      markCartAsRecoveredInSupabase(cleanEmail).catch(() => {});
      setAbandonedCarts((prev) => {
        const next = prev.map((c) =>
          c.customerEmail.toLowerCase() === cleanEmail && c.status !== 'Recovered'
            ? { ...c, status: 'Recovered' as AbandonedCartStatus, updatedAt: new Date().toISOString() }
            : c
        );
        saveAbandonedCartsToStorage(next);
        return next;
      });
    }

    return newOrder;
  };

  const getOrderById = useCallback(
    (orderId: string) => {
      if (!orderId) return undefined;
      const clean = orderId.trim();
      const cleanLower = clean.toLowerCase();
      const numOnly = clean.replace(/[^0-9]/g, '');

      return orders.find((o) => {
        // 1. Exact match by id or orderNumber
        if (o.id === clean || o.orderNumber === clean) return true;
        if (o.id.toLowerCase() === cleanLower || o.orderNumber.toLowerCase() === cleanLower) return true;
        // 2. Suffix / number match: e.g. "ord-7471" matches "SS-2026-7471"
        if (numOnly && (o.orderNumber.endsWith(numOnly) || o.id.endsWith(numOnly))) return true;
        // 3. Substring match
        if (o.orderNumber.toLowerCase().includes(cleanLower) || cleanLower.includes(o.orderNumber.toLowerCase()))
          return true;
        return false;
      });
    },
    [orders]
  );

  const updateOrder = useCallback(
    async (orderId: string, updates: Partial<Order>): Promise<boolean> => {
      let targetKey = orderId;

      setOrders((prev) => {
        const numOnly = orderId.replace(/[^0-9]/g, '');
        const next = prev.map((o) => {
          const matches =
            o.id === orderId ||
            o.orderNumber === orderId ||
            (numOnly && (o.id.includes(numOnly) || o.orderNumber.includes(numOnly)));
          if (matches) {
            targetKey = o.id || o.orderNumber;
            return { ...o, ...updates };
          }
          return o;
        });
        try {
          localStorage.setItem('supersnake_orders', JSON.stringify(next));
        } catch (e) {}
        return next;
      });

      try {
        const success = await updateOrderInSupabase(targetKey, updates);
        return success;
      } catch (err) {
        console.warn('Failed to sync order update to Supabase:', err);
        return false;
      }
    },
    []
  );

  // Product actions
  const saveProductsToLocalStorage = (productList: Product[]) => {
    try {
      localStorage.setItem('supersnake_products', JSON.stringify(productList));
    } catch (err) {
      console.warn('LocalStorage quota exceeded, storing lightweight offline cache:', err);
      try {
        const lightList = productList.map((p) => ({
          ...p,
          images: p.images.slice(0, 2),
        }));
        localStorage.setItem('supersnake_products', JSON.stringify(lightList));
      } catch (inner) {
        console.warn('Could not cache products in localStorage:', inner);
      }
    }
  };

  const setSignatureProduct = async (productId: string): Promise<{ success: boolean; error?: string }> => {
    const target = products.find((p) => p.id === productId || p.slug === productId);
    if (!target) {
      return { success: false, error: 'Product not found.' };
    }

    const updated = products.map((p) => ({
      ...p,
      isSignature: p.id === target.id || p.slug === target.slug,
    }));

    setProducts(updated);
    saveProductsToLocalStorage(updated);

    try {
      await setSignatureProductInSupabase(target.id);
    } catch (err) {
      console.warn('Could not sync signature product to Supabase:', err);
    }

    return { success: true };
  };

  const addProduct = async (newProduct: Product) => {
    const isSignatureRequested = Boolean(newProduct.isSignature);
    const seen = new Set<string>();
    const cleanProduct: Product = {
      ...newProduct,
      isSignature: false, // Normal product creation never directly writes signature
      images: (newProduct.images || []).filter((img) => {
        if (!img?.url || seen.has(img.url)) return false;
        seen.add(img.url);
        return true;
      }),
    };
    setProducts((prev) => {
      const next = [cleanProduct, ...prev];
      saveProductsToLocalStorage(next);
      return next;
    });
    createProductInSupabase(cleanProduct).catch((err) => {
      console.warn('Could not sync product to Supabase:', err);
    });

    if (isSignatureRequested) {
      await setSignatureProduct(cleanProduct.id);
    }
  };

  const updateProduct = (updatedProduct: Product) => {
    const seen = new Set<string>();
    const existing = products.find((p) => p.id === updatedProduct.id || p.slug === updatedProduct.slug);
    const cleanProduct: Product = {
      ...updatedProduct,
      isSignature: existing?.isSignature ?? false, // Never mutate signature status via updateProduct
      images: (updatedProduct.images || []).filter((img) => {
        if (!img?.url || seen.has(img.url)) return false;
        seen.add(img.url);
        return true;
      }),
    };
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === cleanProduct.id || p.slug === cleanProduct.slug ? cleanProduct : p));
      saveProductsToLocalStorage(next);
      return next;
    });
    updateProductInSupabase(cleanProduct).catch((err) => {
      console.warn('Could not sync product update to Supabase:', err);
    });
  };

  const deleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId || p.slug === productId);
    if (target?.isSignature) {
      throw new Error('This product is currently the Signature Product. Please select another Signature Product before deleting or archiving it.');
    }
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== productId && p.slug !== productId);
      saveProductsToLocalStorage(next);
      return next;
    });
    deleteProductFromSupabase(productId).catch((err) => {
      console.warn('Could not delete product from Supabase:', err);
    });
  };

  const getProductBySlug = (slug: string) => {
    return products.find((p) => p.slug === slug);
  };

  const updateHomepageConfig = async (config: Partial<HomepageConfig>): Promise<boolean> => {
    const nextConfig: HomepageConfig = {
      ...homepageConfig,
      ...config,
      ...(config.heroImages ? { heroImages: cleanHeroImages(config.heroImages) } : {}),
      ...(config.menCollectionImage !== undefined
        ? { menCollectionImage: cleanCollectionImage(config.menCollectionImage, '/men-collection.png') }
        : {}),
      ...(config.womenCollectionImage !== undefined
        ? { womenCollectionImage: cleanCollectionImage(config.womenCollectionImage, '/women-collection.png') }
        : {}),
      ...(config.signatureTeeImage !== undefined
        ? { signatureTeeImage: cleanCollectionImage(config.signatureTeeImage, '/signature-tee-spotlight.png') }
        : {}),
      ...(config.supersnakeTeeImage !== undefined
        ? { supersnakeTeeImage: cleanCollectionImage(config.supersnakeTeeImage, '/hero-object-supersnake-tee.png') }
        : {}),
      ...(config.pillar1Image !== undefined
        ? { pillar1Image: cleanCollectionImage(config.pillar1Image, '/brand-pillar-fabric.png') }
        : {}),
      ...(config.pillar2Image !== undefined
        ? { pillar2Image: cleanCollectionImage(config.pillar2Image, '/brand-pillar-fit.png') }
        : {}),
      ...(config.pillar3Image !== undefined
        ? { pillar3Image: cleanCollectionImage(config.pillar3Image, '/brand-pillar-finish.png') }
        : {}),
    };

    setHomepageConfig(nextConfig);

    try {
      localStorage.setItem('supersnake_homepage_config', JSON.stringify(nextConfig));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    try {
      const supabaseSuccess = await saveHomepageConfigToSupabase(nextConfig);
      return supabaseSuccess;
    } catch (err) {
      console.warn('Supabase homepage config sync error:', err);
      return false;
    }
  };

  const updateSocialConfig = async (config: Partial<SocialConfig>): Promise<boolean> => {
    const nextConfig: SocialConfig = {
      ...socialConfig,
      ...config,
      ...(config.communityImages ? { communityImages: cleanCommunityImages(config.communityImages) } : {}),
    };

    setSocialConfig(nextConfig);

    try {
      localStorage.setItem('supersnake_social_config', JSON.stringify(nextConfig));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    try {
      const ok = await saveSocialConfigToSupabase(nextConfig);
      return ok;
    } catch (err) {
      console.warn('Supabase social config sync error:', err);
      return false;
    }
  };

  const addSubscriber = async (email: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) return false;

    if (subscribers.some((s) => s.email.toLowerCase() === cleanEmail)) {
      return true;
    }

    const newSub: NewsletterSubscriber = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      email: cleanEmail,
      createdAt: new Date().toISOString(),
      source: 'Footer Snake Pit Roster',
    };

    const updated = [newSub, ...subscribers];
    setSubscribers(updated);

    try {
      localStorage.setItem('supersnake_newsletter_subscribers', JSON.stringify(updated));
    } catch (e) {}

    try {
      await subscribeNewsletterInSupabase(cleanEmail);
    } catch (e) {}

    return true;
  };

  const deleteSubscriber = async (id: string): Promise<boolean> => {
    const target = subscribers.find((s) => s.id === id);
    const updated = subscribers.filter((s) => s.id !== id);
    setSubscribers(updated);

    try {
      localStorage.setItem('supersnake_newsletter_subscribers', JSON.stringify(updated));
    } catch (e) {}

    try {
      if (target) {
        await deleteSubscriberFromSupabase(target.id);
      }
    } catch (e) {}

    return true;
  };

  const refreshDefectReports = async (): Promise<DefectReport[]> => {
    try {
      const supabaseDefects = await fetchDefectReportsFromSupabase();
      if (supabaseDefects) {
        setDefectReports((prev) => {
          const map = new Map<string, DefectReport>();
          supabaseDefects.forEach((d) => map.set(d.id, d));
          prev.forEach((d) => {
            if (!map.has(d.id) && !map.has(d.reportNumber)) {
              map.set(d.id, d);
            }
          });
          const merged = Array.from(map.values());
          saveDefectReportsToStorage(merged);
          return merged;
        });
        return supabaseDefects;
      }
    } catch (e) {
      console.warn('Error refreshing defect reports from Supabase:', e);
    }
    return defectReports;
  };

  const submitDefectReport = async (
    reportData: Omit<DefectReport, 'id' | 'reportNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<DefectReport> => {
    const timestamp = Date.now().toString().slice(-4);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newReport: DefectReport = {
      ...reportData,
      id: `def-${Date.now()}-${randomSuffix}`,
      reportNumber: `SS-DEF-${new Date().getFullYear()}-${timestamp}`,
      status: 'Pending Review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDefectReports((prev) => {
      const next = [newReport, ...prev.filter((r) => r.id !== newReport.id && r.reportNumber !== newReport.reportNumber)];
      saveDefectReportsToStorage(next);
      return next;
    });

    try {
      window.dispatchEvent(new Event('supersnake_defects_change'));
    } catch (e) {}

    createDefectReportInSupabase(newReport).catch((err) => {
      console.warn('Could not sync defect report to Supabase:', err);
    });

    return newReport;
  };

  const updateDefectReportStatus = async (
    id: string,
    status: DefectStatus,
    notes?: string
  ): Promise<boolean> => {
    let targetReportNumber = '';
    setDefectReports((prev) => {
      const next = prev.map((r) => {
        if (r.id === id) {
          targetReportNumber = r.reportNumber;
          return {
            ...r,
            status,
            ...(notes !== undefined ? { adminNotes: notes } : {}),
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      });
      saveDefectReportsToStorage(next);
      return next;
    });

    try {
      window.dispatchEvent(new Event('supersnake_defects_change'));
    } catch (e) {}

    try {
      await updateDefectReportInSupabase(id, {
        status,
        adminNotes: notes,
        reportNumber: targetReportNumber,
      });
      return true;
    } catch (e) {
      return false;
    }
  };

  // Abandoned Carts
  const syncAbandonedCart = useCallback(
    async (customerInfo?: { email: string; name?: string; phone?: string; userId?: string }) => {
      try {
        let email = customerInfo?.email;
        let name = customerInfo?.name;
        let phone = customerInfo?.phone;
        let userId = customerInfo?.userId;

        if (!email && typeof window !== 'undefined') {
          const savedContact = localStorage.getItem('supersnake_customer_contact');
          if (savedContact) {
            try {
              const parsed = JSON.parse(savedContact);
              email = parsed.email;
              name = name || parsed.name;
              phone = phone || parsed.phone;
              userId = userId || parsed.userId;
            } catch (e) {}
          }
        }

        if (!email && typeof window !== 'undefined') {
          const savedProfile = localStorage.getItem('supersnake_user_profile');
          if (savedProfile) {
            try {
              const parsed = JSON.parse(savedProfile);
              email = parsed.email;
              name = name || parsed.fullName;
              phone = phone || parsed.phone;
              userId = userId || parsed.id;
            } catch (e) {}
          }
        }

        if (!email) return;

        const cleanEmail = email.trim().toLowerCase();
        try {
          localStorage.setItem(
            'supersnake_customer_contact',
            JSON.stringify({ email: cleanEmail, name, phone, userId })
          );
        } catch (e) {}

        const currentCart = cart.length > 0 ? cart : loadCartFromStorageSync();
        if (currentCart.length === 0) return;

        const items: AbandonedCartItem[] = currentCart.map((item) => ({
          id: item.id,
          productId: item.product.id,
          productName: item.product.name,
          productSlug: item.product.slug,
          colorName: item.selectedColor.name,
          colorHex: item.selectedColor.hex,
          size: item.selectedSize,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.product.images?.[0]?.url || '',
        }));

        const subtotal = currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const itemCount = currentCart.reduce((sum, item) => sum + item.quantity, 0);
        const now = new Date().toISOString();

        // Optimistically update local state
        setAbandonedCarts((prev) => {
          const existingIdx = prev.findIndex(
            (c) => c.customerEmail.toLowerCase() === cleanEmail && c.status !== 'Recovered'
          );
          let next: AbandonedCart[];
          if (existingIdx > -1) {
            next = [...prev];
            next[existingIdx] = {
              ...next[existingIdx],
              customerName: name || next[existingIdx].customerName,
              customerPhone: phone || next[existingIdx].customerPhone,
              items,
              subtotal,
              itemCount,
              lastActiveAt: now,
              updatedAt: now,
            };
          } else {
            const newCart: AbandonedCart = {
              id: `cart-${Date.now()}`,
              userId,
              customerName: name || 'Anonymous Patron',
              customerEmail: cleanEmail,
              customerPhone: phone,
              items,
              subtotal,
              itemCount,
              status: 'Active',
              lastActiveAt: now,
              createdAt: now,
              updatedAt: now,
            };
            next = [newCart, ...prev];
          }
          saveAbandonedCartsToStorage(next);
          return next;
        });

        // Sync to Supabase
        await syncAbandonedCartToSupabase({
          userId,
          customerName: name || 'Anonymous Patron',
          customerEmail: cleanEmail,
          customerPhone: phone,
          items,
          subtotal,
          itemCount,
          status: 'Active',
          lastActiveAt: now,
        });
      } catch (err) {
        console.warn('Could not sync customer cart:', err);
      }
    },
    [cart]
  );

  const updateAbandonedCartStatus = async (
    cartId: string,
    status: AbandonedCartStatus,
    notes?: string,
    discountOffered?: string
  ): Promise<boolean> => {
    setAbandonedCarts((prev) => {
      const next = prev.map((c) => {
        if (c.id === cartId) {
          return {
            ...c,
            status,
            ...(notes !== undefined ? { notes } : {}),
            ...(discountOffered !== undefined ? { discountOffered } : {}),
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });
      saveAbandonedCartsToStorage(next);
      return next;
    });

    try {
      await updateAbandonedCartStatusInSupabase(cartId, status, notes, discountOffered);
      return true;
    } catch {
      return false;
    }
  };

  const refreshAbandonedCarts = async (): Promise<AbandonedCart[]> => {
    try {
      const data = await fetchAbandonedCartsFromSupabase();
      if (data && data.length > 0) {
        setAbandonedCarts(data);
        saveAbandonedCartsToStorage(data);
        return data;
      }
    } catch (e) {}
    return abandonedCarts;
  };

  const refreshMaintenanceConfig = async (): Promise<MaintenanceConfig> => {
    try {
      const res = await fetch('/api/admin/maintenance');
      if (res.ok) {
        const data = await res.json();
        const cfg = data.config || data;
        if (cfg && typeof cfg.maintenanceMode === 'boolean') {
          setMaintenanceConfig(cfg);
          try {
            localStorage.setItem('supersnake_maintenance_config', JSON.stringify(cfg));
          } catch (e) {}
          return cfg;
        }
      }
    } catch (e) {}

    try {
      const dbConfig = await fetchMaintenanceConfigFromSupabase();
      if (dbConfig) {
        setMaintenanceConfig(dbConfig);
        try {
          localStorage.setItem('supersnake_maintenance_config', JSON.stringify(dbConfig));
        } catch (e) {}
        return dbConfig;
      }
    } catch (e) {}

    return maintenanceConfig;
  };

  const updateMaintenanceConfig = async (
    updates: Partial<MaintenanceConfig>,
    adminEmail?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const userEmail = adminEmail || 'supersnake.in@gmail.com';
    const updated: MaintenanceConfig = {
      ...maintenanceConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail,
    };

    // Optimistic local update
    setMaintenanceConfig(updated);
    try {
      localStorage.setItem('supersnake_maintenance_config', JSON.stringify(updated));
      window.dispatchEvent(new Event('supersnake_maintenance_change'));
    } catch (e) {}

    try {
      const res = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          adminEmail: userEmail,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.config) {
        setMaintenanceConfig(data.config);
        try {
          localStorage.setItem('supersnake_maintenance_config', JSON.stringify(data.config));
        } catch (e) {}
        return { success: true };
      }

      if (!res.ok) {
        // Fallback to direct Supabase update
        const directSuccess = await updateMaintenanceConfigInSupabase(updated, userEmail);
        if (directSuccess) return { success: true };
        return { success: false, error: data.message || 'Failed to update maintenance configuration' };
      }
    } catch (err: any) {
      console.warn('API maintenance call failed, attempting direct Supabase write:', err);
      try {
        const directSuccess = await updateMaintenanceConfigInSupabase(updated, userEmail);
        if (directSuccess) return { success: true };
      } catch (dbErr: any) {
        return { success: false, error: dbErr?.message || 'Database connection error' };
      }
    }

    return { success: true };
  };

  const refreshStorefrontConfig = async (): Promise<StorefrontConfig> => {
    try {
      const res = await fetch('/api/storefront-mode');
      if (res.ok) {
        const cfg = await res.json();
        if (cfg && cfg.storefrontMode) {
          setStorefrontConfig(cfg);
          try {
            localStorage.setItem('supersnake_storefront_config', JSON.stringify(cfg));
          } catch (e) {}
          return cfg;
        }
      }
    } catch (e) {}

    try {
      const dbConfig = await fetchStorefrontConfigFromSupabase();
      if (dbConfig) {
        setStorefrontConfig(dbConfig);
        try {
          localStorage.setItem('supersnake_storefront_config', JSON.stringify(dbConfig));
        } catch (e) {}
        return dbConfig;
      }
    } catch (e) {}

    return storefrontConfig;
  };

  const updateStorefrontConfig = async (
    updates: Partial<StorefrontConfig>,
    adminEmail?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const userEmail = adminEmail || 'supersnake.in@gmail.com';
    const updated: StorefrontConfig = {
      ...storefrontConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail,
    };

    // Optimistic local update
    setStorefrontConfig(updated);
    if (updates.storefrontMode) {
      setMaintenanceConfig((prev) => ({
        ...prev,
        maintenanceMode: updates.storefrontMode === 'MAINTENANCE',
      }));
    }
    try {
      localStorage.setItem('supersnake_storefront_config', JSON.stringify(updated));
      window.dispatchEvent(new Event('supersnake_storefront_change'));
    } catch (e) {}

    try {
      const res = await fetch('/api/admin/storefront-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          adminEmail: userEmail,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.config) {
        setStorefrontConfig(data.config);
        try {
          localStorage.setItem('supersnake_storefront_config', JSON.stringify(data.config));
        } catch (e) {}
        return { success: true };
      }

      if (!res.ok) {
        const directSuccess = await updateStorefrontConfigInSupabase(updated, userEmail);
        if (directSuccess) return { success: true };
        return { success: false, error: data.message || 'Failed to update storefront mode' };
      }
    } catch (err: any) {
      console.warn('API storefront mode update failed, writing directly to Supabase:', err);
      try {
        const directSuccess = await updateStorefrontConfigInSupabase(updated, userEmail);
        if (directSuccess) return { success: true };
      } catch (dbErr: any) {
        return { success: false, error: dbErr?.message || 'Database connection error' };
      }
    }

    return { success: true };
  };

  const toggleProductPreLaunch = async (
    productId: string,
    enabled: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    if (enabled) {
      const currentCount = products.filter((p) => p.preLaunchEnabled && p.id !== productId).length;
      const limit = storefrontConfig.preLaunchProductLimit || 6;
      if (currentCount >= limit) {
        return {
          success: false,
          error: `You can currently feature a maximum of ${limit} products during Pre-Launch. Disable an existing product before adding another.`,
        };
      }
    }

    // Update in memory and localStorage
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === productId ? { ...p, preLaunchEnabled: enabled } : p));
      saveProductsToLocalStorage(next);
      return next;
    });

    try {
      await toggleProductPreLaunchInSupabase(productId, enabled);
    } catch (e) {
      console.warn('Could not sync pre-launch toggle to Supabase:', e);
    }

    return { success: true };
  };

  const refreshPreBookings = async (): Promise<PreBooking[]> => {
    try {
      const data = await fetchPreBookingsFromSupabase();
      if (data && data.length > 0) {
        setPreBookings(data);
        try {
          localStorage.setItem('supersnake_pre_bookings', JSON.stringify(data));
        } catch (e) {}
        return data;
      }
    } catch (e) {}
    return preBookings;
  };

  const createPreBooking = async (
    bookingData: Partial<PreBooking> & Omit<PreBooking, 'id' | 'bookingNumber' | 'createdAt' | 'updatedAt' | 'bookingStatus'>
  ): Promise<PreBooking> => {
    const existingId = (bookingData as any).id;
    const existingBookingNumber = (bookingData as any).bookingNumber || (bookingData as any).referenceCode;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = existingBookingNumber || `SS-PB-${new Date().getFullYear()}-${randomSuffix}`;
    const newBooking: PreBooking = {
      ...bookingData,
      id: existingId || `pb-${Date.now()}-${randomSuffix}`,
      bookingNumber,
      referenceCode: bookingNumber,
      bookingStatus: (bookingData as any).bookingStatus || (bookingData as any).status || 'CONFIRMED',
      status: (bookingData as any).status || (bookingData as any).bookingStatus || 'CONFIRMED',
      createdAt: (bookingData as any).createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPreBookings((prev) => {
      const filtered = prev.filter((b) => {
        if (newBooking.id && b.id === newBooking.id) return false;
        if (newBooking.bookingNumber && (b.bookingNumber === newBooking.bookingNumber || b.referenceCode === newBooking.bookingNumber)) return false;
        if (newBooking.razorpayPaymentId && b.razorpayPaymentId && b.razorpayPaymentId === newBooking.razorpayPaymentId) return false;
        return true;
      });
      const next = [newBooking, ...filtered];
      try {
        localStorage.setItem('supersnake_pre_bookings', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // Only create in Supabase if this booking didn't come already created from /api/pre-booking
    if (!existingId) {
      try {
        await createPreBookingInSupabase(newBooking);
      } catch (err) {
        console.warn('Could not persist pre-booking directly to Supabase:', err);
      }
    }

    return newBooking;
  };

  const updatePreBookingStatus = async (
    id: string,
    bookingStatus: PreBookingStatus,
    notes?: string,
    paymentStatus?: 'Paid' | 'Pending' | 'Reservation'
  ): Promise<boolean> => {
    setPreBookings((prev) => {
      const next = prev.map((b) => {
        if (b.id === id) {
          return {
            ...b,
            bookingStatus,
            status: bookingStatus,
            ...(notes !== undefined ? { adminNotes: notes } : {}),
            ...(paymentStatus !== undefined ? { paymentStatus } : {}),
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      });
      try {
        localStorage.setItem('supersnake_pre_bookings', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await updatePreBookingInSupabase(id, {
        bookingStatus,
        status: bookingStatus,
        adminNotes: notes,
        paymentStatus,
      });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        isLoaded,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        setSignatureProduct,
        getProductBySlug,
        homepageConfig,
        updateHomepageConfig,
        socialConfig,
        updateSocialConfig,
        subscribers,
        addSubscriber,
        deleteSubscriber,
        cart,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        setCartItem,
        setCart: setCartState,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        isSearchOpen,
        openSearch,
        closeSearch,
        orders,
        createOrder,
        getOrderById,
        updateOrder,
        freeShippingThreshold,
        updateFreeShippingThreshold,
        defectReports,
        submitDefectReport,
        updateDefectReportStatus,
        refreshDefectReports,
        abandonedCarts,
        syncAbandonedCart,
        updateAbandonedCartStatus,
        refreshAbandonedCarts,
        maintenanceConfig,
        updateMaintenanceConfig,
        refreshMaintenanceConfig,
        storefrontConfig,
        updateStorefrontConfig,
        refreshStorefrontConfig,
        toggleProductPreLaunch,
        preBookings,
        createPreBooking,
        updatePreBookingStatus,
        refreshPreBookings,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
