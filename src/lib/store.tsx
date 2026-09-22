'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Product, CartItem, WishlistItem, Size, Order, SocialConfig, NewsletterSubscriber, DefectReport, DefectStatus } from './types';
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
  updateOrder: (orderId: string, updates: Partial<Order>) => void;

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

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('supersnake_threshold_change', handleCustomChange);
    window.addEventListener('supersnake_defects_change', handleDefectsChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('supersnake_threshold_change', handleCustomChange);
      window.removeEventListener('supersnake_defects_change', handleDefectsChange);
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

  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrders((prev) => {
      const numOnly = orderId.replace(/[^0-9]/g, '');
      const next = prev.map((o) => {
        const matches =
          o.id === orderId ||
          o.orderNumber === orderId ||
          (numOnly && (o.id.includes(numOnly) || o.orderNumber.includes(numOnly)));
        return matches ? { ...o, ...updates } : o;
      });
      try {
        localStorage.setItem('supersnake_orders', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

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
