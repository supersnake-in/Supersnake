'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartItem, WishlistItem, Size, Order } from './types';
import { PRODUCTS } from './data/products';
import {
  fetchProductsFromSupabase,
  createProductInSupabase,
  deleteProductFromSupabase,
  createOrderInSupabase,
  fetchOrdersFromSupabase,
} from './supabase/db';

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

  // Products Catalog (Admin & Storefront synchronized)
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  getProductBySlug: (slug: string) => Product | undefined;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync from localStorage & Supabase
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('supersnake_products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      }

      const savedCart = localStorage.getItem('supersnake_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('supersnake_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedOrders = localStorage.getItem('supersnake_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.warn('Failed to load storage:', e);
    }
    setIsLoaded(true);

    // Fetch dynamic products from Supabase
    fetchProductsFromSupabase()
      .then((supabaseProducts) => {
        if (supabaseProducts && supabaseProducts.length > 0) {
          setProducts(supabaseProducts);
        }
      })
      .catch((err) => {
        console.warn('Supabase fetch failed, continuing with cached/fallback products:', err);
      });

    // Fetch dynamic orders from Supabase
    fetchOrdersFromSupabase()
      .then((supabaseOrders) => {
        if (supabaseOrders && supabaseOrders.length > 0) {
          setOrders(supabaseOrders);
        }
      })
      .catch((err) => {
        console.warn('Supabase orders fetch failed:', err);
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
        carrier: 'SuperSnake Express / Blue Dart',
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

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductBySlug,
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
