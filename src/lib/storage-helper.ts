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
 * Sanitizes cart items for storage by keeping only the primary image and omitting unneeded variants.
 * Crucially, it NEVER wipes or blanks out the primary image URL.
 */
export function sanitizeCartItem(item: CartItem): CartItem {
  const p = item.product;
  if (!p) return item;

  let images = p.images || [];
  if (images.length > 1) {
    images = [images[0]];
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

  const sanitized = cart.map((item) => sanitizeCartItem(item));
  const serialized = JSON.stringify(sanitized);

  // 1. Save to localStorage
  try {
    localStorage.setItem('supersnake_cart', serialized);
  } catch (e) {
    console.warn('localStorage cart save warning:', e);
  }

  // 2. Also mirror to sessionStorage (separate quota)
  try {
    sessionStorage.setItem('supersnake_cart', serialized);
  } catch (e) {}

  // 3. Persist complete unstripped cart to IndexedDB (virtually unlimited quota)
  idbSet('supersnake_cart', cart).catch(() => {});
}

export function loadCartFromStorageSync(): CartItem[] {
  if (typeof window === 'undefined') return [];

  // Try localStorage
  try {
    const saved = localStorage.getItem('supersnake_cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  // Try sessionStorage
  try {
    const sessionSaved = sessionStorage.getItem('supersnake_cart');
    if (sessionSaved) {
      const parsed = JSON.parse(sessionSaved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return [];
}

export async function loadCartFromStorageAsync(): Promise<CartItem[]> {
  const syncItems = loadCartFromStorageSync();
  if (syncItems.length > 0) return syncItems;

  // Fallback to IndexedDB
  try {
    const idbItems = await idbGet<CartItem[]>('supersnake_cart');
    if (Array.isArray(idbItems) && idbItems.length > 0) {
      // Re-populate localStorage for fast synchronous reads
      saveCartToStorage(idbItems);
      return idbItems;
    }
  } catch (e) {}

  return [];
}

export function saveLastCheckout(item: LastCheckoutItem): void {
  if (typeof window === 'undefined') return;
  const data = JSON.stringify(item);
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
