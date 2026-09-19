import { CartItem, Product, Size } from './types';

export interface LastCheckoutItem {
  productId: string;
  slug: string;
  size: Size;
  color: { name: string; hex: string };
  quantity: number;
  product?: Product;
}

const DB_NAME = 'supersnake_db';
const STORE_NAME = 'keyval';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbSet(key: string, value: any): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    // Non-blocking
  }
}

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    return null;
  }
}

/**
 * Deduplicates cart items by product slug/ID, size, and color to prevent duplicate entries.
 */
export function deduplicateCart(cartItems: CartItem[]): CartItem[] {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return [];
  const map = new Map<string, CartItem>();
  for (const item of cartItems) {
    if (!item || !item.product) continue;
    // Slug is the canonical unique identifier across admin, db, and storefront
    const productKey = (item.product.slug || item.product.id || '').trim().toLowerCase();
    const colorKey = (item.selectedColor?.name || '').trim().toLowerCase();
    const sizeKey = (item.selectedSize || '').trim().toLowerCase();
    const key = `${productKey}_${sizeKey}_${colorKey}`;

    if (map.has(key)) {
      const existing = map.get(key)!;
      // If duplicate entries exist for the same item, keep the single accurate entry
      // Prefer the lower quantity to heal accidental double-additions from reloads
      const resolvedQty = Math.max(1, Math.min(existing.quantity, item.quantity));
      map.set(key, {
        ...existing,
        quantity: resolvedQty,
        product: (existing.product?.images?.length ?? 0) > 0 ? existing.product : item.product,
      });
    } else {
      map.set(key, {
        ...item,
        quantity: Math.max(1, item.quantity || 1),
      });
    }
  }
  return Array.from(map.values());
}

/**
 * Sanitizes cart items for storage by keeping only the primary image and omitting unneeded variants.
 * Crucially, if the primary image is a huge Base64 data URL (>2KB), it strips the data URL string
 * for localStorage/sessionStorage so browser quota (5MB) is never exceeded.
 * The image URL will be resolved dynamically from products catalog or IndexedDB on display.
 */
export function sanitizeCartItem(item: CartItem): CartItem {
  const p = item.product;
  if (!p) return item;

  let images = p.images || [];
  if (images.length > 0) {
    const first = images[0];
    if (first?.url && first.url.startsWith('data:') && first.url.length > 2048) {
      images = [{ ...first, url: '' }];
    } else {
      images = [first];
    }
  }

  return {
    ...item,
    product: {
      ...p,
      images,
      variants: [],
    },
  };
}

export function saveCartToStorage(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;

  const deduped = deduplicateCart(cart);
  const sanitized = deduped.map((item) => sanitizeCartItem(item));
  const serialized = JSON.stringify(sanitized);

  // 1. Save to localStorage with quota protection and fallback
  try {
    localStorage.setItem('supersnake_cart', serialized);
  } catch (e) {
    console.warn('localStorage cart save warning, attempting aggressive trim:', e);
    try {
      // Fallback: strip all images completely if quota is still exceeded
      const ultraLean = deduped.map((item) => ({
        ...item,
        product: {
          ...item.product,
          images: [],
          variants: [],
        },
      }));
      localStorage.setItem('supersnake_cart', JSON.stringify(ultraLean));
    } catch (e2) {
      console.error('localStorage cart save critical failure:', e2);
    }
  }

  // 2. Also mirror to sessionStorage (separate quota)
  try {
    sessionStorage.setItem('supersnake_cart', serialized);
  } catch (e) {
    try {
      const ultraLean = deduped.map((item) => ({
        ...item,
        product: {
          ...item.product,
          images: [],
          variants: [],
        },
      }));
      sessionStorage.setItem('supersnake_cart', JSON.stringify(ultraLean));
    } catch (e2) {}
  }

  // 3. Persist complete unstripped cart to IndexedDB (virtually unlimited quota)
  idbSet('supersnake_cart', deduped).catch(() => {});
}

export function loadCartFromStorageSync(): CartItem[] {
  if (typeof window === 'undefined') return [];

  // Try localStorage
  try {
    const saved = localStorage.getItem('supersnake_cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return deduplicateCart(parsed);
    }
  } catch (e) {}

  // Try sessionStorage
  try {
    const sessionSaved = sessionStorage.getItem('supersnake_cart');
    if (sessionSaved) {
      const parsed = JSON.parse(sessionSaved);
      if (Array.isArray(parsed) && parsed.length > 0) return deduplicateCart(parsed);
    }
  } catch (e) {}

  return [];
}

export async function loadCartFromStorageAsync(): Promise<CartItem[]> {
  const syncItems = loadCartFromStorageSync();
  if (syncItems.length > 0) return deduplicateCart(syncItems);

  // Fallback to IndexedDB
  try {
    const idbItems = await idbGet<CartItem[]>('supersnake_cart');
    if (Array.isArray(idbItems) && idbItems.length > 0) {
      const deduped = deduplicateCart(idbItems);
      // Re-populate localStorage for fast synchronous reads
      saveCartToStorage(deduped);
      return deduped;
    }
  } catch (e) {}

  return [];
}

export function saveLastCheckout(item: LastCheckoutItem): void {
  if (typeof window === 'undefined') return;
  // Strip large Base64 images from last checkout to protect storage quota
  const leanItem: LastCheckoutItem = {
    ...item,
    product: item.product
      ? {
          ...item.product,
          images:
            item.product.images?.length > 0 &&
            item.product.images[0]?.url?.startsWith('data:') &&
            item.product.images[0].url.length > 2048
              ? [{ ...item.product.images[0], url: '' }]
              : item.product.images,
          variants: [],
        }
      : undefined,
  };
  const data = JSON.stringify(leanItem);
  try {
    sessionStorage.setItem('supersnake_last_checkout', data);
  } catch (e) {}
  try {
    localStorage.setItem('supersnake_last_checkout', data);
  } catch (e) {}
  idbSet('supersnake_last_checkout', item).catch(() => {});
}

export function loadLastCheckout(): LastCheckoutItem | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = sessionStorage.getItem('supersnake_last_checkout') || localStorage.getItem('supersnake_last_checkout');
    if (s) {
      const parsed = JSON.parse(s);
      if (parsed && (parsed.slug || parsed.productId)) return parsed;
    }
  } catch (e) {}
  return null;
}
