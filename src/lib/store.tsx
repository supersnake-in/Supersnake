'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartItem, WishlistItem, Size, Order } from './types';
import {
  fetchProductsFromSupabase,
  createProductInSupabase,
  deleteProductFromSupabase,
  createOrderInSupabase,
  fetchOrdersFromSupabase,
  fetchHomepageConfigFromSupabase,
  saveHomepageConfigToSupabase,
} from './supabase/db';

export interface HomepageConfig {
  heroImages: string[];
  heroIntervalSeconds: number;
  heroHeadline: string;
  heroSupportingCopy: string;
  spotlightProductId: string;
  brandStatement: string;
  menCollectionImage?: string;
  womenCollectionImage?: string;
}

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  heroImages: [
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=2400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=2400&auto=format&fit=crop',
  ],
  heroIntervalSeconds: 3,
  heroHeadline: 'WEAR YOUR INSTINCT.',
  heroSupportingCopy: 'Premium T-shirts. Designed for your everyday. Engineered for presence.',
  spotlightProductId: 'the-signature-tee',
  brandStatement: 'NOT MADE TO BLEND IN.',
  menCollectionImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1600&auto=format&fit=crop',
  womenCollectionImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop',
};

interface StoreContextType {
  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size: Size, color: { name: string; hex: string }, quantity?: number) => void;
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
  getProductBySlug: (slug: string) => Product | undefined;

  // Homepage Configuration
  homepageConfig: HomepageConfig;
  updateHomepageConfig: (config: Partial<HomepageConfig>) => Promise<boolean>;
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync from localStorage & Supabase
  useEffect(() => {
    try {
      // Purge any legacy mock products from browser storage
      const savedProducts = localStorage.getItem('supersnake_products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed)) {
          const realProducts = parsed.filter((p) => !p.id?.startsWith('prod-0'));
          setProducts(realProducts);
          localStorage.setItem('supersnake_products', JSON.stringify(realProducts));
        }
      }

      const savedCart = localStorage.getItem('supersnake_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

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

      // Homepage configuration
      const savedHomepage = localStorage.getItem('supersnake_homepage_config');
      if (savedHomepage) {
        try {
          const parsed = JSON.parse(savedHomepage);
          if (parsed && Array.isArray(parsed.heroImages) && parsed.heroImages.length > 0) {
            setHomepageConfig((prev) => ({ ...prev, ...parsed }));
          }
        } catch (e) {}
      }
    } catch (e) {
      console.warn('Failed to load storage:', e);
    }
    setIsLoaded(true);

    // Fetch dynamic products from Supabase (Single Source of Truth)
    fetchProductsFromSupabase()
      .then((supabaseProducts) => {
        if (supabaseProducts !== null) {
          setProducts(supabaseProducts);
        }
      })
      .catch((err) => {
        console.warn('Supabase fetch failed:', err);
      });

    // Fetch dynamic orders from Supabase (Single Source of Truth)
    fetchOrdersFromSupabase()
      .then((supabaseOrders) => {
        if (supabaseOrders !== null) {
          setOrders(supabaseOrders);
        }
      })
      .catch((err) => {
        console.warn('Supabase orders fetch failed:', err);
      });

    // Fetch dynamic homepage config from Supabase
    fetchHomepageConfigFromSupabase()
      .then((supabaseHomepage) => {
        if (supabaseHomepage !== null && supabaseHomepage.heroImages.length > 0) {
          setHomepageConfig(supabaseHomepage);
          try {
            localStorage.setItem('supersnake_homepage_config', JSON.stringify(supabaseHomepage));
          } catch (e) {}
        }
      })
      .catch((err) => {
        console.warn('Supabase homepage config fetch failed:', err);
      });
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('supersnake_products', JSON.stringify(products));
    } catch (e) {}
  }, [products, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('supersnake_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart, isLoaded]);

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

  const addToCart = (
    product: Product,
    size: Size,
    color: { name: string; hex: string },
    quantity: number = 1
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor.name === color.name
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      const newItem: CartItem = {
        id: `${product.id}-${color.name}-${size}-${Date.now()}`,
        product,
        selectedColor: color,
        selectedSize: size,
        quantity,
        price: product.price,
      };
      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

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

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    createOrderInSupabase(newOrder).catch((err) => {
      console.warn('Could not sync order to Supabase:', err);
    });
    return newOrder;
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, ...updates } : o))
    );
  };

  // Product actions
  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    createProductInSupabase(newProduct).catch((err) => {
      console.warn('Could not sync product to Supabase:', err);
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
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

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductBySlug,
        homepageConfig,
        updateHomepageConfig,
        cart,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
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
