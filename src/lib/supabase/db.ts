import { supabase } from './client';
import {
  Product,
  Order,
  ProductVariant,
  ProductImage,
  HomepageConfig,
  SocialConfig,
  NewsletterSubscriber,
  DefectReport,
  AbandonedCart,
  AbandonedCartItem,
  AbandonedCartStatus,
  MaintenanceConfig,
  StorefrontConfig,
  PreBooking,
  PreBookingStatus,
} from '../types';

// In-memory catalog cache (60s) to prevent repetitive PostgREST egress bursts
let cachedProducts: Product[] | null = null;
let productsCacheTime = 0;

/**
 * Maps a Supabase products row to the Product TypeScript interface
 */
export function mapProductRowToProduct(row: any): Product {
  const sortedImages = (row.images || []).sort(
    (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  // Deduplicate images by URL to guarantee no repeated shots
  const seenUrls = new Set<string>();
  const deduplicatedImages = sortedImages.filter((img: any) => {
    if (!img.url || seenUrls.has(img.url)) return false;
    seenUrls.add(img.url);
    return true;
  });

  const images: ProductImage[] = deduplicatedImages.map((img: any, idx: number) => ({
    url: img.url,
    alt: img.alt || `${row.name} view ${idx + 1}`,
    angle: img.angle || (idx === 0 ? 'front' : idx === 1 ? 'model' : 'fabric'),
    isPrimary: idx === 0,
  }));

  const variants: ProductVariant[] = (row.variants || []).map((v: any) => ({
    id: v.id,
    sku: v.sku,
    colorName: v.color_name,
    colorHex: v.color_hex,
    size: v.size,
    stock: v.stock,
    price: Number(v.price || row.price),
    mrp: Number(v.mrp || row.mrp),
  }));

  // Extract colors from row.colors if saved directly, otherwise derive from variants
  const variantColors = Array.from(
    new Map(variants.map((v) => [v.colorName, { name: v.colorName, hex: v.colorHex }])).values()
  );
  const colors = Array.isArray(row.colors) && row.colors.length > 0
    ? row.colors
    : variantColors.length > 0
      ? variantColors
      : [{ name: 'Obsidian Black', hex: '#0a0a0a' }];

  // Extract sizes from row.sizes if saved directly, otherwise derive from variants
  const variantSizes = Array.from(new Set(variants.map((v) => v.size)));
  const sizes = Array.isArray(row.sizes) && row.sizes.length > 0
    ? row.sizes
    : variantSizes.length > 0
      ? (variantSizes as any)
      : ['S', 'M', 'L', 'XL'];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline || '',
    description: row.description || '',
    gender: row.gender,
    fit: row.fit,
    price: Number(row.price),
    mrp: Number(row.mrp),
    gsm: Number(row.gsm),
    fabric: row.fabric,
    weightText: row.weight_text || undefined,
    careInstructions: row.care_instructions || [],
    features: row.features || [],
    shippingPolicy: row.shipping_policy || undefined,
    images: images.length > 0 ? images : [],
    colors,
    sizes,
    variants,
    isNew: row.is_new,
    isBestseller: row.is_bestseller,
    isSpotlight: row.is_spotlight,
    isSignature: Boolean(row.is_signature),
    preLaunchEnabled: Boolean(row.pre_launch_enabled),
    maxPreBookings: row.max_pre_bookings ? Number(row.max_pre_bookings) : undefined,
    rating: Number(row.rating || 5.0),
    reviewsCount: Number(row.reviews_count || 0),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * FETCH SINGLE PRODUCT BY SLUG DYNAMICALLY FROM SUPABASE
 * Downloads ONLY the single requested product with its images and variants,
 * eliminating the need to download the entire catalog on product pages.
 */
export async function fetchProductBySlugFromSupabase(slug: string): Promise<Product | null> {
  if (!slug) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        tagline,
        description,
        gender,
        fit,
        price,
        mrp,
        gsm,
        fabric,
        weight_text,
        care_instructions,
        features,
        shipping_policy,
        colors,
        sizes,
        is_signature,
        is_spotlight,
        is_bestseller,
        is_new,
        pre_launch_enabled,
        max_pre_bookings,
        rating,
        reviews_count,
        created_at,
        images:product_images(id, url, alt, angle, display_order),
        variants:product_variants(id, sku, color_name, color_hex, size, stock, price, mrp)
      `)
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching product by slug from Supabase:', error.message);
      return null;
    }

    if (!data) return null;
    return mapProductRowToProduct(data);
  } catch (err) {
    console.warn('Exception fetching product by slug:', err);
    return null;
  }
}

/**
 * FETCH PRODUCTS DYNAMICALLY FROM SUPABASE FOR LISTINGS
 * Selects only explicit required fields, caches in memory for 60s,
 * and eliminates the client-side delete/insert loop.
 */
export async function fetchProductsFromSupabase(forceRefresh: boolean = false): Promise<Product[] | null> {
  const now = Date.now();
  if (!forceRefresh && cachedProducts && now - productsCacheTime < 60000) {
    return cachedProducts;
  }

  try {
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        tagline,
        description,
        gender,
        fit,
        price,
        mrp,
        gsm,
        fabric,
        weight_text,
        care_instructions,
        features,
        shipping_policy,
        colors,
        sizes,
        is_signature,
        is_spotlight,
        is_bestseller,
        is_new,
        pre_launch_enabled,
        max_pre_bookings,
        rating,
        reviews_count,
        created_at,
        images:product_images(id, url, alt, angle, display_order),
        variants:product_variants(id, sku, color_name, color_hex, size, stock, price, mrp)
      `)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.warn('Supabase fetch error (tables may need migration):', productsError.message);
      return null;
    }

    if (!productsData || productsData.length === 0) {
      return null;
    }

    // Map Supabase rows to Product TypeScript interface
    cachedProducts = productsData.map(mapProductRowToProduct);
    productsCacheTime = now;
    return cachedProducts;
  } catch (err) {
    console.warn('Supabase products fetch failed, using local store:', err);
    return null;
  }
}

/**
 * CREATE PRODUCT DYNAMICALLY IN SUPABASE
 */
export async function createProductInSupabase(product: Product): Promise<boolean> {
  try {
    // 1. Check if product already exists by slug (idempotent / upsert behavior)
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', product.slug)
      .maybeSingle();

    if (existing) {
      return await updateProductInSupabase({ ...product, id: existing.id });
    }

    // 2. Insert product row
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);
    const insertPayload: any = {
      name: product.name,
      slug: product.slug,
      tagline: product.tagline,
      description: product.description,
      gender: product.gender,
      fit: product.fit,
      price: product.price,
      mrp: product.mrp,
      gsm: product.gsm,
      fabric: product.fabric,
      weight_text: product.weightText,
      care_instructions: product.careInstructions,
      features: product.features,
      shipping_policy: product.shippingPolicy,
      is_spotlight: Boolean(product.isSpotlight),
      is_bestseller: Boolean(product.isBestseller),
      is_new: Boolean(product.isNew),
      rating: product.rating,
      reviews_count: product.reviewsCount,
      colors: product.colors,
      sizes: product.sizes,
      pre_launch_enabled: Boolean(product.preLaunchEnabled),
      max_pre_bookings: product.maxPreBookings || null,
    };
    if (isUuid) {
      insertPayload.id = product.id;
    }

    const { data: insertedProduct, error: productError } = await supabase
      .from('products')
      .insert(insertPayload)
      .select()
      .single();

    if (productError || !insertedProduct) {
      console.warn('Supabase product insert error:', productError?.message || productError);
      return false;
    }

    const productId = insertedProduct.id;

    // 3. Insert images (deduplicated by URL)
    if (product.images && product.images.length > 0) {
      // Ensure unique images by URL
      const uniqueImages = Array.from(
        new Map(product.images.map((img) => [img.url, img])).values()
      );

      // Clean existing images for this product ID first
      await supabase.from('product_images').delete().eq('product_id', productId);

      const imageRows = uniqueImages.map((img, idx) => {
        const rawAngle = (img.angle || '').toLowerCase();
        const angle = ['front', 'back', 'detail', 'model', 'fabric', 'studio', 'side'].includes(rawAngle)
          ? rawAngle
          : 'front';
        return {
          product_id: productId,
          url: img.url,
          alt: img.alt || `${product.name} view ${idx + 1}`,
          angle,
          display_order: idx,
        };
      });
      const { error: imgErr } = await supabase.from('product_images').insert(imageRows);
      if (imgErr) {
        console.warn('Supabase images batch insert error, retrying individually:', imgErr.message);
        for (const row of imageRows) {
          await supabase.from('product_images').insert(row);
        }
      }
    }

    // 4. Insert variants
    if (product.variants && product.variants.length > 0) {
      const variantRows = product.variants.map((v, idx) => ({
        product_id: productId,
        sku:
          v.sku ||
          `SS-${product.slug.slice(0, 6).toUpperCase()}-${v.colorName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()}-${v.size}-${idx}`,
        color_name: v.colorName,
        color_hex: v.colorHex,
        size: v.size,
        stock: v.stock || 25,
        price: v.price || product.price,
        mrp: v.mrp || product.mrp,
      }));
      const { error: varErr } = await supabase.from('product_variants').insert(variantRows);
      if (varErr) console.warn('Supabase variants insert error:', varErr.message);
    }

    return true;
  } catch (err) {
    console.warn('Error saving to Supabase:', err);
    return false;
  }
}

/**
 * DELETE PRODUCT FROM SUPABASE
 */
export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    const query = supabase.from('products').delete();
    const { error } = isUuid ? await query.eq('id', productId) : await query.eq('slug', productId);
    return !error;
  } catch (err) {
    return false;
  }
}

/**
 * ATOMICALLY SET SIGNATURE PRODUCT IN SUPABASE VIA SECURE RPC / SERVER ENDPOINT
 */
export async function setSignatureProductInSupabase(productId: string): Promise<boolean> {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/admin/products/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        const data = await res.json();
        return Boolean(data.success);
      }
      return false;
    }

    const { error } = await supabase.rpc('set_signature_product', { target_product_id: productId });
    if (error) {
      console.warn('Supabase set_signature_product RPC error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Could not set signature product in Supabase:', err);
    return false;
  }
}

/**
 * UPDATE PRODUCT IN SUPABASE (all fields, images, variants)
 */
export async function updateProductInSupabase(product: Product): Promise<boolean> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);

    // 1. Update product table row
    const updatePayload: any = {
      name: product.name,
      slug: product.slug,
      tagline: product.tagline,
      description: product.description,
      gender: product.gender,
      fit: product.fit,
      price: product.price,
      mrp: product.mrp,
      gsm: product.gsm,
      fabric: product.fabric,
      weight_text: product.weightText,
      care_instructions: product.careInstructions,
      features: product.features,
      shipping_policy: product.shippingPolicy,
      is_spotlight: Boolean(product.isSpotlight),
      is_bestseller: Boolean(product.isBestseller),
      is_new: Boolean(product.isNew),
      rating: product.rating,
      reviews_count: product.reviewsCount,
      colors: product.colors,
      sizes: product.sizes,
      pre_launch_enabled: Boolean(product.preLaunchEnabled),
      max_pre_bookings: product.maxPreBookings || null,
      updated_at: new Date().toISOString(),
    };

    let targetId = product.id;

    if (isUuid) {
      const { data: updatedRows, error } = await supabase.from('products').update(updatePayload).eq('id', product.id).select('id');
      if (error) console.warn('Supabase update product error by id:', error.message);
      if (!updatedRows || updatedRows.length === 0) {
        // ID didn't exist in Supabase products table; fallback to slug
        const { data: existingBySlug } = await supabase
          .from('products')
          .select('id')
          .eq('slug', product.slug)
          .maybeSingle();

        if (existingBySlug) {
          targetId = existingBySlug.id;
          await supabase.from('products').update(updatePayload).eq('id', targetId);
        } else {
          return await createProductInSupabase(product);
        }
      }
    } else {
      // Find product by slug
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('slug', product.slug)
        .maybeSingle();

      if (existing) {
        targetId = existing.id;
        const { error } = await supabase.from('products').update(updatePayload).eq('id', targetId);
        if (error) console.warn('Supabase update product error by slug:', error.message);
      } else {
        // If it doesn't exist, create it
        return await createProductInSupabase(product);
      }
    }

    // 2. Update product images (delete old & insert new unique images)
    if (product.images && product.images.length > 0) {
      // Ensure unique images by URL
      const uniqueImages = Array.from(
        new Map(product.images.map((img) => [img.url, img])).values()
      );

      await supabase.from('product_images').delete().eq('product_id', targetId);
      const imageRows = uniqueImages.map((img, idx) => {
        const rawAngle = (img.angle || '').toLowerCase();
        const angle = ['front', 'back', 'detail', 'model', 'fabric', 'studio', 'side'].includes(rawAngle)
          ? rawAngle
          : 'front';
        return {
          product_id: targetId,
          url: img.url,
          alt: img.alt || `${product.name} view ${idx + 1}`,
          angle,
          display_order: idx,
        };
      });
      const { error: imgErr } = await supabase.from('product_images').insert(imageRows);
      if (imgErr) {
        console.warn('Supabase update images batch error, retrying individually:', imgErr.message);
        for (const row of imageRows) {
          await supabase.from('product_images').insert(row);
        }
      }
    }

    // 3. Update product variants (delete old & insert new)
    if (product.variants && product.variants.length > 0) {
      await supabase.from('product_variants').delete().eq('product_id', targetId);
      const variantRows = product.variants.map((v, idx) => ({
        product_id: targetId,
        sku:
          v.sku ||
          `SS-${product.slug.slice(0, 6).toUpperCase()}-${v.colorName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()}-${v.size}-${idx}`,
        color_name: v.colorName,
        color_hex: v.colorHex,
        size: v.size,
        stock: v.stock || 25,
        price: v.price || product.price,
        mrp: v.mrp || product.mrp,
      }));
      const { error: varErr } = await supabase.from('product_variants').insert(variantRows);
      if (varErr) console.warn('Supabase update variants error:', varErr.message);
    }

    return true;
  } catch (err) {
    console.warn('Supabase update product failed:', err);
    return false;
  }
}

/**
 * Maps a Supabase order row to the Order TypeScript interface
 */
export function mapOrderRowToOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    status: row.status,
    phoneVerified: Boolean(row.phone_verified),
    items: Array.isArray(row.items)
      ? row.items.map((it: any) => ({
          productId: it.product_id || '',
          productName: it.product_name,
          color: it.color,
          size: it.size,
          quantity: it.quantity,
          price: Number(it.price),
          imageUrl: it.image_url || '',
        }))
      : [],
    subtotal: Number(row.subtotal),
    discount: Number(row.discount || 0),
    shipping: Number(row.shipping || 0),
    tax: Number(row.tax || 0),
    total: Number(row.total),
    customer: {
      name: row.customer_name || 'Customer',
      email: row.customer_email || '',
      phone: row.customer_phone || '',
    },
    shippingAddress: row.shipping_address || {},
    payment: {
      method: row.payment_method || 'card',
      transactionId: row.transaction_id || '',
      status: row.payment_status || 'paid',
      paidAt: row.created_at,
    },
    tracking: row.tracking_info,
  };
}

/**
 * CREATE ORDER IN SUPABASE
 */
export async function createOrderInSupabase(order: Order): Promise<boolean> {
  try {
    const { data: insertedOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        customer_phone: order.customer.phone,
        shipping_address: order.shippingAddress,
        payment_method: order.payment.method,
        payment_status: order.payment.status,
        transaction_id: order.payment.transactionId,
        tracking_info: order.tracking,
      })
      .select('id, order_number')
      .single();

    if (orderError || !insertedOrder) {
      console.warn('Order insert error in Supabase:', orderError);
      return false;
    }

    if (order.items && order.items.length > 0) {
      const itemRows = order.items.map((it) => ({
        order_id: insertedOrder.id,
        product_name: it.productName,
        color: it.color,
        size: it.size,
        quantity: it.quantity,
        price: it.price,
        image_url: it.imageUrl,
      }));
      await supabase.from('order_items').insert(itemRows);
    }

    return true;
  } catch (err) {
    console.warn('Error creating order in Supabase:', err);
    return false;
  }
}

/**
 * FETCH SINGLE ORDER BY ID OR ORDER NUMBER FROM SUPABASE
 * Downloads order details and order items ONLY for this specific order.
 */
export async function fetchOrderByIdFromSupabase(idOrNumber: string): Promise<Order | null> {
  if (!idOrNumber) return null;
  try {
    const clean = idOrNumber.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);

    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        customer_name,
        customer_email,
        customer_phone,
        phone_verified,
        shipping_address,
        payment_method,
        payment_status,
        transaction_id,
        tracking_info,
        created_at,
        items:order_items(id, product_id, product_name, color, size, quantity, price, image_url)
      `);

    if (isUuid) {
      query = query.eq('id', clean);
    } else if (clean.toUpperCase().startsWith('SS-')) {
      query = query.eq('order_number', clean);
    } else {
      query = query.ilike('order_number', `%${clean}%`);
    }

    const { data, error } = await query.maybeSingle();
    if (error || !data) return null;
    return mapOrderRowToOrder(data);
  } catch (err) {
    console.warn('Error fetching order by ID from Supabase:', err);
    return null;
  }
}

/**
 * FETCH ORDER ITEMS ON-DEMAND FOR AN ORDER
 */
export async function fetchOrderItemsFromSupabase(orderIdOrNumber: string): Promise<any[]> {
  if (!orderIdOrNumber) return [];
  try {
    const clean = orderIdOrNumber.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
    let orderUuid = clean;

    if (!isUuid) {
      const { data: ord } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', clean)
        .maybeSingle();
      if (!ord?.id) return [];
      orderUuid = ord.id;
    }

    const { data, error } = await supabase
      .from('order_items')
      .select('id, product_id, product_name, color, size, quantity, price, image_url')
      .eq('order_id', orderUuid);

    if (error || !data) return [];
    return data.map((it: any) => ({
      productId: it.product_id || '',
      productName: it.product_name,
      color: it.color,
      size: it.size,
      quantity: it.quantity,
      price: Number(it.price),
      imageUrl: it.image_url || '',
    }));
  } catch (err) {
    return [];
  }
}

/**
 * FETCH ORDERS DYNAMICALLY FROM SUPABASE
 * Does NOT download all historical order items in bulk.
 * Supports pagination and optional filtering by customer email or status.
 */
export async function fetchOrdersFromSupabase(options?: {
  page?: number;
  pageSize?: number;
  status?: string;
  customerEmail?: string;
}): Promise<Order[] | null> {
  try {
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        customer_name,
        customer_email,
        customer_phone,
        phone_verified,
        shipping_address,
        payment_method,
        payment_status,
        transaction_id,
        tracking_info,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (options?.customerEmail) {
      query = query.eq('customer_email', options.customerEmail.trim().toLowerCase());
    }

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    if (options?.page !== undefined) {
      const pageSize = options.pageSize || 25;
      const offset = options.page * pageSize;
      query = query.range(offset, offset + pageSize - 1);
    } else if (!options?.customerEmail) {
      // Default to 50 for unrestricted list
      query = query.limit(50);
    }

    const { data: ordersData, error: ordersError } = await query;

    if (ordersError || !ordersData || ordersData.length === 0) {
      return null;
    }

    return ordersData.map(mapOrderRowToOrder);
  } catch (err) {
    console.warn('Error fetching orders from Supabase:', err);
    return null;
  }
}

/**
 * UPDATE ORDER IN SUPABASE (Status, Tracking, Workflow)
 */
export async function updateOrderInSupabase(
  orderIdOrNumber: string,
  updates: Partial<Order>
): Promise<boolean> {
  try {
    const payload: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.status) payload.status = updates.status;
    if (updates.tracking) payload.tracking_info = updates.tracking;
    if (updates.payment?.status) payload.payment_status = updates.payment.status;
    if (updates.phoneVerified !== undefined) payload.phone_verified = updates.phoneVerified;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdOrNumber);

    let query = supabase.from('orders').update(payload);
    if (isUuid) {
      query = query.eq('id', orderIdOrNumber);
    } else {
      query = query.eq('order_number', orderIdOrNumber);
    }

    const { error } = await query;
    if (error) {
      console.warn('Supabase order update warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception updating order in Supabase:', err);
    return false;
  }
}

/**
 * SUBSCRIBE NEWSLETTER IN SUPABASE
 * Upserts email with ignoreDuplicates to avoid HTTP 400/409 errors on duplicate submissions.
 */
export async function subscribeNewsletterInSupabase(email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email: email.trim().toLowerCase() }, { onConflict: 'email', ignoreDuplicates: true });
    return !error;
  } catch (err) {
    return false;
  }
}

// In-memory cache for homepage configuration (5 minutes)
let cachedHomepageConfig: HomepageConfig | null = null;
let homepageConfigCacheTime = 0;

/**
 * FETCH HOMEPAGE CONFIG FROM SUPABASE
 * Explicit columns and 5-minute in-memory caching to eliminate redundant PostgREST egress.
 */
export async function fetchHomepageConfigFromSupabase(forceRefresh: boolean = false): Promise<HomepageConfig | null> {
  const now = Date.now();
  if (!forceRefresh && cachedHomepageConfig && now - homepageConfigCacheTime < 300000) {
    return cachedHomepageConfig;
  }

  try {
    const { data, error } = await supabase
      .from('homepage_config')
      .select(`
        hero_images,
        hero_interval_seconds,
        hero_headline,
        hero_supporting_copy,
        spotlight_product_id,
        brand_statement,
        men_collection_image,
        women_collection_image,
        supersnake_tee_image,
        signature_tee_image,
        pillar1_image,
        pillar2_image,
        pillar3_image,
        hero_object_eyebrow,
        hero_object_title,
        hero_object_quote,
        hero_object_badge,
        hero_object_spec1_eyebrow,
        hero_object_spec1_title,
        hero_object_spec1_desc,
        hero_object_spec2_eyebrow,
        hero_object_spec2_title,
        hero_object_spec2_desc,
        hero_object_spec3_eyebrow,
        hero_object_spec3_title,
        hero_object_spec3_desc
      `)
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    cachedHomepageConfig = {
      heroImages: Array.isArray(data.hero_images) && data.hero_images.length > 0 ? data.hero_images : [],
      heroIntervalSeconds: Number(data.hero_interval_seconds || 3),
      heroHeadline: data.hero_headline || '',
      heroSupportingCopy: data.hero_supporting_copy || '',
      spotlightProductId: data.spotlight_product_id || '',
      brandStatement: data.brand_statement || '',
      menCollectionImage: data.men_collection_image || undefined,
      womenCollectionImage: data.women_collection_image || undefined,
      supersnakeTeeImage: data.supersnake_tee_image || undefined,
      signatureTeeImage: data.signature_tee_image || undefined,
      pillar1Image: data.pillar1_image || undefined,
      pillar2Image: data.pillar2_image || undefined,
      pillar3Image: data.pillar3_image || undefined,
      heroObjectEyebrow: data.hero_object_eyebrow || undefined,
      heroObjectTitle: data.hero_object_title || undefined,
      heroObjectQuote: data.hero_object_quote || undefined,
      heroObjectBadge: data.hero_object_badge || undefined,
      heroObjectSpec1Eyebrow: data.hero_object_spec1_eyebrow || undefined,
      heroObjectSpec1Title: data.hero_object_spec1_title || undefined,
      heroObjectSpec1Desc: data.hero_object_spec1_desc || undefined,
      heroObjectSpec2Eyebrow: data.hero_object_spec2_eyebrow || undefined,
      heroObjectSpec2Title: data.hero_object_spec2_title || undefined,
      heroObjectSpec2Desc: data.hero_object_spec2_desc || undefined,
      heroObjectSpec3Eyebrow: data.hero_object_spec3_eyebrow || undefined,
      heroObjectSpec3Title: data.hero_object_spec3_title || undefined,
      heroObjectSpec3Desc: data.hero_object_spec3_desc || undefined,
    };
    homepageConfigCacheTime = now;
    return cachedHomepageConfig;
  } catch (err) {
    console.warn('Supabase homepage config fetch failed:', err);
    return null;
  }
}

/**
 * SAVE HOMEPAGE CONFIG TO SUPABASE
 */
export async function saveHomepageConfigToSupabase(config: HomepageConfig): Promise<boolean> {
  cachedHomepageConfig = null;
  try {
    const { error } = await supabase
      .from('homepage_config')
      .upsert(
        {
          id: 'default',
          hero_images: config.heroImages,
          hero_interval_seconds: config.heroIntervalSeconds,
          hero_headline: config.heroHeadline,
          hero_supporting_copy: config.heroSupportingCopy,
          spotlight_product_id: config.spotlightProductId,
          brand_statement: config.brandStatement,
          men_collection_image: config.menCollectionImage,
          women_collection_image: config.womenCollectionImage,
          supersnake_tee_image: config.supersnakeTeeImage,
          signature_tee_image: config.signatureTeeImage,
          pillar1_image: config.pillar1Image,
          pillar2_image: config.pillar2Image,
          pillar3_image: config.pillar3Image,
          hero_object_eyebrow: config.heroObjectEyebrow,
          hero_object_title: config.heroObjectTitle,
          hero_object_quote: config.heroObjectQuote,
          hero_object_badge: config.heroObjectBadge,
          hero_object_spec1_eyebrow: config.heroObjectSpec1Eyebrow,
          hero_object_spec1_title: config.heroObjectSpec1Title,
          hero_object_spec1_desc: config.heroObjectSpec1Desc,
          hero_object_spec2_eyebrow: config.heroObjectSpec2Eyebrow,
          hero_object_spec2_title: config.heroObjectSpec2Title,
          hero_object_spec2_desc: config.heroObjectSpec2Desc,
          hero_object_spec3_eyebrow: config.heroObjectSpec3Eyebrow,
          hero_object_spec3_title: config.heroObjectSpec3Title,
          hero_object_spec3_desc: config.heroObjectSpec3Desc,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('Supabase homepage config save error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase homepage config save failed:', err);
    return false;
  }
}

/**
 * FETCH NEWSLETTER SUBSCRIBERS FROM SUPABASE
 * Explicit columns and capped query to prevent unbounded list downloads.
 */
export async function fetchSubscribersFromSupabase(limit: number = 50): Promise<NewsletterSubscriber[] | null> {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, source, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return null;
    }

    return data.map((row: any) => ({
      id: row.id || `sub-${row.email}`,
      email: row.email,
      createdAt: row.created_at || new Date().toISOString(),
      source: row.source || 'Footer Snake Pit Roster',
    }));
  } catch (err) {
    console.warn('Error fetching subscribers from Supabase:', err);
    return null;
  }
}

/**
 * DELETE SUBSCRIBER FROM SUPABASE
 */
export async function deleteSubscriberFromSupabase(idOrEmail: string): Promise<boolean> {
  try {
    const isId = idOrEmail.includes('-') && !idOrEmail.includes('@');
    const query = isId
      ? supabase.from('newsletter_subscribers').delete().eq('id', idOrEmail)
      : supabase.from('newsletter_subscribers').delete().eq('email', idOrEmail);
    const { error } = await query;
    return !error;
  } catch (err) {
    return false;
  }
}

// In-memory cache for social configuration (5 minutes)
let cachedSocialConfig: SocialConfig | null = null;
let socialConfigCacheTime = 0;

/**
 * FETCH SOCIAL CONFIG FROM SUPABASE
 * Explicit columns and 5-minute in-memory caching to eliminate redundant PostgREST egress.
 */
export async function fetchSocialConfigFromSupabase(forceRefresh: boolean = false): Promise<SocialConfig | null> {
  const now = Date.now();
  if (!forceRefresh && cachedSocialConfig && now - socialConfigCacheTime < 300000) {
    return cachedSocialConfig;
  }

  try {
    const { data, error } = await supabase
      .from('social_config')
      .select('community_images, instagram, x, youtube, threads, linkedin, contact_phone')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    cachedSocialConfig = {
      communityImages: Array.isArray(data.community_images) && data.community_images.length > 0 ? data.community_images : [],
      instagram: data.instagram || '',
      x: data.x || '',
      youtube: data.youtube || '',
      threads: data.threads || '',
      linkedin: data.linkedin || '',
      contactPhone: data.contact_phone || '',
    };
    socialConfigCacheTime = now;
    return cachedSocialConfig;
  } catch (err) {
    return null;
  }
}

/**
 * SAVE SOCIAL CONFIG TO SUPABASE
 */
export async function saveSocialConfigToSupabase(config: SocialConfig): Promise<boolean> {
  cachedSocialConfig = null;
  try {
    const { error } = await supabase
      .from('social_config')
      .upsert(
        {
          id: 'default',
          community_images: config.communityImages,
          instagram: config.instagram,
          x: config.x,
          youtube: config.youtube,
          threads: config.threads,
          linkedin: config.linkedin,
          contact_phone: config.contactPhone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    return !error;
  } catch (err) {
    return false;
  }
}

/**
 * CREATE DEFECT REPORT IN SUPABASE
 */
export async function createDefectReportInSupabase(report: DefectReport): Promise<boolean> {
  try {
    const payload: any = {
      report_number: report.reportNumber,
      order_id: report.orderId,
      order_number: report.orderNumber,
      customer_name: report.customerName,
      customer_email: report.customerEmail,
      customer_phone: report.customerPhone,
      product_id: report.productId || null,
      product_name: report.productName,
      product_color: report.productColor || null,
      product_size: report.productSize || null,
      product_image: report.productImage || null,
      defect_type: report.defectType,
      description: report.description,
      images: Array.isArray(report.images) ? report.images : [],
      video_url: report.videoUrl || null,
      status: report.status || 'Pending Review',
      admin_notes: report.adminNotes || null,
      created_at: report.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Safe UUID check: only provide id if it matches standard UUID format
    const isUuid = report.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(report.id);
    const insertPayload: any = { ...payload };
    if (isUuid) {
      insertPayload.id = report.id;
    }

    const { error } = await supabase
      .from('defect_reports')
      .insert(insertPayload);

    if (!error) {
      return true;
    }

    console.warn('Defect report insert error in Supabase:', error.message);
    return false;
  } catch (err) {
    console.warn('Error creating defect report in Supabase:', err);
    return false;
  }
}

/**
 * FETCH DEFECT REPORTS FROM SUPABASE
 * Explicit columns and pagination to avoid transferring heavy media payloads for entire tables.
 */
export async function fetchDefectReportsFromSupabase(options?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<DefectReport[] | null> {
  try {
    const pageSize = options?.pageSize || 25;
    const page = options?.page || 0;
    const offset = page * pageSize;

    let query = supabase
      .from('defect_reports')
      .select(`
        id,
        report_number,
        order_id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        product_id,
        product_name,
        product_color,
        product_size,
        product_image,
        defect_type,
        description,
        images,
        video_url,
        status,
        admin_notes,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    query = query.range(offset, offset + pageSize - 1);

    const { data, error } = await query;

    if (error || !data) {
      return null;
    }

    return data.map((row: any): DefectReport => ({
      id: row.id,
      reportNumber: row.report_number,
      orderId: row.order_id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      productId: row.product_id,
      productName: row.product_name,
      productColor: row.product_color,
      productSize: row.product_size,
      productImage: row.product_image,
      defectType: row.defect_type,
      description: row.description,
      images: Array.isArray(row.images) ? row.images : [],
      videoUrl: row.video_url,
      status: row.status,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (err) {
    console.warn('Error fetching defect reports from Supabase:', err);
    return null;
  }
}

/**
 * UPDATE DEFECT REPORT IN SUPABASE
 */
export async function updateDefectReportInSupabase(
  id: string,
  updates: Partial<DefectReport>
): Promise<boolean> {
  try {
    const payload: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.status) payload.status = updates.status;
    if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;

    // Try updating by ID first
    let { error } = await supabase
      .from('defect_reports')
      .update(payload)
      .eq('id', id);

    // If ID is not UUID and query failed, or if matching by report number is possible
    if (error && updates.reportNumber) {
      const { error: retryError } = await supabase
        .from('defect_reports')
        .update(payload)
        .eq('report_number', updates.reportNumber);
      if (!retryError) return true;
    }

    return !error;
  } catch (err) {
    console.warn('Error updating defect report in Supabase:', err);
    return false;
  }
}

/**
 * FETCH ABANDONED & ACTIVE CARTS FROM SUPABASE
 * Explicit columns and pagination to prevent unbounded list downloads.
 */
export async function fetchAbandonedCartsFromSupabase(options?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<AbandonedCart[] | null> {
  try {
    const pageSize = options?.pageSize || 25;
    const page = options?.page || 0;
    const offset = page * pageSize;

    let query = supabase
      .from('abandoned_carts')
      .select('id, user_id, customer_name, customer_email, customer_phone, items, subtotal, item_count, status, notes, discount_offered, last_active_at, created_at, updated_at')
      .order('last_active_at', { ascending: false });

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    query = query.range(offset, offset + pageSize - 1);

    const { data, error } = await query;

    if (error || !data) {
      return null;
    }

    return data.map((row: any): AbandonedCart => ({
      id: row.id,
      userId: row.user_id,
      customerName: row.customer_name || 'Anonymous Patron',
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone || undefined,
      items: Array.isArray(row.items) ? row.items : [],
      subtotal: Number(row.subtotal) || 0,
      itemCount: Number(row.item_count) || 0,
      status: row.status as AbandonedCartStatus,
      notes: row.notes || undefined,
      discountOffered: row.discount_offered || undefined,
      lastActiveAt: row.last_active_at || row.updated_at || row.created_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (err) {
    console.warn('Error fetching abandoned carts from Supabase:', err);
    return null;
  }
}

/**
 * SYNC / UPSERT CUSTOMER CART TO SUPABASE
 */
export async function syncAbandonedCartToSupabase(
  cartData: Omit<AbandonedCart, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string | null> {
  if (!cartData.customerEmail) return null;

  try {
    const now = new Date().toISOString();
    const cleanEmail = cartData.customerEmail.trim().toLowerCase();

    // Check if an active/abandoned/contacted cart exists for this email
    const { data: existing } = await supabase
      .from('abandoned_carts')
      .select('id, status')
      .eq('customer_email', cleanEmail)
      .neq('status', 'Recovered')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      // Update existing cart
      const { data, error } = await supabase
        .from('abandoned_carts')
        .update({
          user_id: cartData.userId || null,
          customer_name: cartData.customerName || undefined,
          customer_phone: cartData.customerPhone || undefined,
          items: cartData.items,
          subtotal: cartData.subtotal,
          item_count: cartData.itemCount,
          status: existing.status === 'Contacted' ? 'Contacted' : cartData.status || 'Active',
          last_active_at: now,
          updated_at: now,
        })
        .eq('id', existing.id)
        .select('id')
        .single();

      if (!error && data?.id) return data.id;
    } else {
      // Insert new cart record
      const { data, error } = await supabase
        .from('abandoned_carts')
        .insert({
          user_id: cartData.userId || null,
          customer_name: cartData.customerName || 'Anonymous Patron',
          customer_email: cleanEmail,
          customer_phone: cartData.customerPhone || null,
          items: cartData.items,
          subtotal: cartData.subtotal,
          item_count: cartData.itemCount,
          status: cartData.status || 'Active',
          notes: cartData.notes || null,
          discount_offered: cartData.discountOffered || null,
          last_active_at: now,
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single();

      if (!error && data?.id) return data.id;
    }
    return null;
  } catch (err) {
    console.warn('Error syncing abandoned cart to Supabase:', err);
    return null;
  }
}

/**
 * UPDATE ABANDONED CART STATUS IN SUPABASE (Contacted, Recovered, Notes)
 */
export async function updateAbandonedCartStatusInSupabase(
  cartId: string,
  status: AbandonedCartStatus,
  notes?: string,
  discountOffered?: string
): Promise<boolean> {
  try {
    const payload: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (notes !== undefined) payload.notes = notes;
    if (discountOffered !== undefined) payload.discount_offered = discountOffered;

    const { error } = await supabase
      .from('abandoned_carts')
      .update(payload)
      .eq('id', cartId);

    return !error;
  } catch (err) {
    console.warn('Error updating abandoned cart status in Supabase:', err);
    return false;
  }
}

/**
 * MARK CART AS RECOVERED IN SUPABASE (When Customer Checks Out)
 */
export async function markCartAsRecoveredInSupabase(customerEmail: string): Promise<boolean> {
  if (!customerEmail) return false;
  try {
    const cleanEmail = customerEmail.trim().toLowerCase();
    const { error } = await supabase
      .from('abandoned_carts')
      .update({
        status: 'Recovered',
        updated_at: new Date().toISOString(),
      })
      .eq('customer_email', cleanEmail)
      .neq('status', 'Recovered');

    return !error;
  } catch (err) {
    console.warn('Error marking cart as recovered in Supabase:', err);
    return false;
  }
}

// In-memory cache for maintenance configuration (30s)
let cachedMaintenanceConfig: MaintenanceConfig | null = null;
let maintenanceConfigCacheTime = 0;

/**
 * FETCH MAINTENANCE CONFIG FROM SUPABASE
 * Explicit columns and 30-second cache to prevent middleware / store load storms.
 */
export async function fetchMaintenanceConfigFromSupabase(forceRefresh: boolean = false): Promise<MaintenanceConfig | null> {
  const now = Date.now();
  if (!forceRefresh && cachedMaintenanceConfig && now - maintenanceConfigCacheTime < 30000) {
    return cachedMaintenanceConfig;
  }

  try {
    const { data, error } = await supabase
      .from('maintenance_config')
      .select('id, maintenance_mode, maintenance_message, estimated_restore_time, updated_at, updated_by')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    cachedMaintenanceConfig = {
      maintenanceMode: Boolean(data.maintenance_mode),
      maintenanceMessage:
        data.maintenance_message ||
        'We are calibrating the atelier for our next heavyweight drop. The portal will resume normal operations shortly.',
      estimatedRestoreTime: data.estimated_restore_time || null,
      updatedAt: data.updated_at || new Date().toISOString(),
      updatedBy: data.updated_by || 'system',
    };
    maintenanceConfigCacheTime = now;
    return cachedMaintenanceConfig;
  } catch (err) {
    console.warn('Error fetching maintenance config from Supabase:', err);
    return null;
  }
}

/**
 * UPDATE MAINTENANCE CONFIG IN SUPABASE
 */
export async function updateMaintenanceConfigInSupabase(
  config: Partial<MaintenanceConfig>,
  adminEmail: string = 'system'
): Promise<boolean> {
  cachedMaintenanceConfig = null;
  try {
    const now = new Date().toISOString();
    const payload: any = {
      updated_at: now,
      updated_by: adminEmail,
    };

    if (config.maintenanceMode !== undefined) {
      payload.maintenance_mode = Boolean(config.maintenanceMode);
    }
    if (config.maintenanceMessage !== undefined) {
      payload.maintenance_message = config.maintenanceMessage;
    }
    if (config.estimatedRestoreTime !== undefined) {
      payload.estimated_restore_time = config.estimatedRestoreTime || null;
    }

    // Try updating existing row
    const { error } = await supabase
      .from('maintenance_config')
      .upsert(
        {
          id: 'default',
          ...payload,
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('Error updating maintenance config in Supabase:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Exception updating maintenance config in Supabase:', err);
    return false;
  }
}

// In-memory cache for storefront configuration (30s)
let cachedStorefrontConfig: StorefrontConfig | null = null;
let storefrontConfigCacheTime = 0;

/**
 * FETCH STOREFRONT CONFIG FROM SUPABASE
 * Explicit columns and 30-second cache to protect PostgREST from request storms.
 */
export async function fetchStorefrontConfigFromSupabase(forceRefresh: boolean = false): Promise<StorefrontConfig | null> {
  const now = Date.now();
  if (!forceRefresh && cachedStorefrontConfig && now - storefrontConfigCacheTime < 30000) {
    return cachedStorefrontConfig;
  }

  try {
    const { data, error } = await supabase
      .from('storefront_config')
      .select('id, storefront_mode, launch_date, launch_time, launch_timezone, automatic_launch, pre_launch_product_limit, maintenance_message, estimated_restore_time, updated_at, updated_by')
      .eq('id', 'default')
      .maybeSingle();

    if (!error && data) {
      cachedStorefrontConfig = {
        id: data.id || 'default',
        storefrontMode: (data.storefront_mode as any) || 'PRE_LAUNCH',
        launchDate: data.launch_date || '2026-10-14',
        launchTime: data.launch_time || '10:00',
        launchTimezone: data.launch_timezone || 'IST',
        automaticLaunch: Boolean(data.automatic_launch),
        preLaunchProductLimit: Number(data.pre_launch_product_limit || 6),
        maintenanceMessage: data.maintenance_message || '',
        estimatedRestoreTime: data.estimated_restore_time || null,
        updatedAt: data.updated_at || new Date().toISOString(),
        updatedBy: data.updated_by || 'system',
      };
      storefrontConfigCacheTime = now;
      return cachedStorefrontConfig;
    }
  } catch (err) {}

  // Fallback to maintenance_config if storefront_config table not yet migrated
  try {
    const { data: mData } = await supabase
      .from('maintenance_config')
      .select('id, maintenance_mode, maintenance_message, estimated_restore_time, updated_at, updated_by')
      .eq('id', 'default')
      .maybeSingle();

    if (mData) {
      const isMaint = Boolean(mData.maintenance_mode);
      cachedStorefrontConfig = {
        id: 'default',
        storefrontMode: isMaint ? 'MAINTENANCE' : (((mData as any).storefront_mode as any) || 'PRE_LAUNCH'),
        launchDate: (mData as any).launch_date || '2026-10-14',
        launchTime: (mData as any).launch_time || '10:00',
        launchTimezone: (mData as any).launch_timezone || 'IST',
        automaticLaunch: Boolean((mData as any).automatic_launch),
        preLaunchProductLimit: Number((mData as any).pre_launch_product_limit || 6),
        maintenanceMessage: mData.maintenance_message || '',
        estimatedRestoreTime: mData.estimated_restore_time || null,
        updatedAt: mData.updated_at || new Date().toISOString(),
        updatedBy: mData.updated_by || 'system',
      };
      storefrontConfigCacheTime = now;
      return cachedStorefrontConfig;
    }
  } catch (err) {}

  return null;
}

/**
 * UPDATE STOREFRONT CONFIG IN SUPABASE
 */
export async function updateStorefrontConfigInSupabase(
  config: Partial<StorefrontConfig>,
  adminEmail: string = 'system'
): Promise<boolean> {
  cachedStorefrontConfig = null;
  cachedMaintenanceConfig = null;
  try {
    const now = new Date().toISOString();
    const payload: any = {
      updated_at: now,
      updated_by: adminEmail,
    };

    if (config.storefrontMode !== undefined) payload.storefront_mode = config.storefrontMode;
    if (config.launchDate !== undefined) payload.launch_date = config.launchDate;
    if (config.launchTime !== undefined) payload.launch_time = config.launchTime;
    if (config.launchTimezone !== undefined) payload.launch_timezone = config.launchTimezone;
    if (config.automaticLaunch !== undefined) payload.automatic_launch = Boolean(config.automaticLaunch);
    if (config.preLaunchProductLimit !== undefined) payload.pre_launch_product_limit = Number(config.preLaunchProductLimit);
    if (config.maintenanceMessage !== undefined) payload.maintenance_message = config.maintenanceMessage;
    if (config.estimatedRestoreTime !== undefined) payload.estimated_restore_time = config.estimatedRestoreTime || null;

    // 1. Try upserting into storefront_config
    const { error: sfError } = await supabase
      .from('storefront_config')
      .upsert({ id: 'default', ...payload }, { onConflict: 'id' });

    if (sfError) {
      console.warn('Notice: storefront_config upsert warning (migration may be pending):', sfError.message);
    }

    // 2. Also synchronize maintenance_config for backwards-compatibility
    const maintPayload: any = {
      updated_at: now,
      updated_by: adminEmail,
      maintenance_mode: config.storefrontMode === 'MAINTENANCE',
    };
    if (config.maintenanceMessage !== undefined) maintPayload.maintenance_message = config.maintenanceMessage;
    if (config.estimatedRestoreTime !== undefined) maintPayload.estimated_restore_time = config.estimatedRestoreTime || null;

    await supabase.from('maintenance_config').upsert({ id: 'default', ...maintPayload }, { onConflict: 'id' });

    return true;
  } catch (err) {
    console.warn('Exception updating storefront config in Supabase:', err);
    return false;
  }
}

/**
 * TOGGLE PRODUCT PRE-LAUNCH IN SUPABASE
 */
export async function toggleProductPreLaunchInSupabase(
  productId: string,
  preLaunchEnabled: boolean
): Promise<boolean> {
  cachedProducts = null;
  try {
    const { error } = await supabase
      .from('products')
      .update({ pre_launch_enabled: preLaunchEnabled, updated_at: new Date().toISOString() })
      .eq('id', productId);

    return !error;
  } catch (err) {
    console.warn('Error toggling product pre-launch in Supabase:', err);
    return false;
  }
}

/**
 * FETCH PRE-BOOKINGS FROM SUPABASE
 * Explicit columns, SQL-level filtering by code/email/phone, and pagination
 * to prevent downloading the entire table into client memory.
 */
export async function fetchPreBookingsFromSupabase(options?: {
  code?: string;
  email?: string;
  phone?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<PreBooking[] | null> {
  try {
    let query = supabase
      .from('pre_bookings')
      .select(`
        id,
        booking_number,
        product_id,
        product_name,
        product_slug,
        product_image,
        color_name,
        color_hex,
        size,
        quantity,
        unit_price,
        total_amount,
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        payment_status,
        payment_method,
        razorpay_payment_id,
        razorpay_order_id,
        paid_at,
        booking_status,
        admin_notes,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (options?.code) {
      const cleanCode = options.code.trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanCode);
      if (isUuid) {
        query = query.eq('id', cleanCode);
      } else {
        query = query.eq('booking_number', cleanCode);
      }
    } else if (options?.search) {
      const q = options.search.trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q);
      if (isUuid) {
        query = query.eq('id', q);
      } else {
        query = query.or(`booking_number.ilike.%${q}%,customer_email.ilike.%${q}%,customer_name.ilike.%${q}%`);
      }
    } else if (options?.email) {
      query = query.eq('customer_email', options.email.trim().toLowerCase());
    } else if (options?.phone) {
      const cleanPhone = options.phone.replace(/\D/g, '').slice(-10);
      if (cleanPhone) {
        query = query.ilike('customer_phone', `%${cleanPhone}`);
      }
    }

    if (options?.limit) {
      const off = options.offset || 0;
      query = query.range(off, off + options.limit - 1);
    } else if (!options?.code && !options?.email && !options?.phone) {
      query = query.limit(50);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Error fetching pre_bookings from Supabase:', error.message);
      return null;
    }

    return (data || []).map((row: any) => {
      const shipping = row.shipping_address || {};
      const bookingNo = row.booking_number || `SS-PB-${row.id.slice(0, 8).toUpperCase()}`;
      const unitPr = Number(row.unit_price || 0);
      const qty = Number(row.quantity || 1);
      const totalAmt = Number(row.total_amount || unitPr * qty);
      const bStatus = (row.booking_status || 'CONFIRMED').toUpperCase() as PreBookingStatus;

      return {
        id: row.id,
        bookingNumber: bookingNo,
        referenceCode: bookingNo,
        customerId: row.customer_id || undefined,
        customerName: row.customer_name || 'Guest Patron',
        customerEmail: row.customer_email || '',
        customerPhone: row.customer_phone || '',
        streetAddress: shipping.street || '',
        city: shipping.city || '',
        state: shipping.state || '',
        pincode: shipping.postalCode || '',
        postOffice: shipping.postOffice || (row as any).post_office || undefined,
        productId: row.product_id,
        productName: row.product_name,
        productSlug: row.product_slug,
        productImage: row.product_image || undefined,
        colorName: row.color_name,
        colorHex: row.color_hex || '#0a0a0a',
        size: row.size,
        quantity: qty,
        unitPrice: unitPr,
        productPrice: unitPr,
        totalAmount: totalAmt,
        totalPrice: totalAmt,
        paymentStatus: (row.payment_status as any) || 'Reservation',
        paymentMethod: row.payment_method || undefined,
        razorpayPaymentId: row.razorpay_payment_id || undefined,
        razorpayOrderId: row.razorpay_order_id || undefined,
        paidAt: row.paid_at || undefined,
        bookingStatus: bStatus,
        status: bStatus,
        shippingAddress: row.shipping_address || undefined,
        adminNotes: row.admin_notes || undefined,
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('Exception fetching pre_bookings from Supabase:', err);
    return null;
  }
}

/**
 * CREATE PRE-BOOKING IN SUPABASE
 */
export async function createPreBookingInSupabase(booking: PreBooking): Promise<boolean> {
  try {
    const bookingNum = booking.referenceCode || booking.bookingNumber;
    const unitPr = booking.unitPrice || booking.productPrice || 0;
    const totalAmt = booking.totalAmount || booking.totalPrice || unitPr * booking.quantity;
    const bStatus = (booking.status || booking.bookingStatus || 'CONFIRMED').toUpperCase();

    const shipping = booking.shippingAddress || {
      fullName: booking.customerName || '',
      phone: booking.customerPhone || '',
      street: booking.streetAddress || '',
      city: booking.city || '',
      state: booking.state || '',
      postalCode: booking.pincode || '',
      postOffice: booking.postOffice || '',
      country: 'India',
    };

    const payload = {
      id: booking.id,
      booking_number: bookingNum,
      customer_id: booking.customerId || null,
      customer_name: booking.customerName,
      customer_email: booking.customerEmail.toLowerCase().trim(),
      customer_phone: booking.customerPhone || null,
      product_id: booking.productId,
      product_name: booking.productName,
      product_slug: booking.productSlug,
      product_image: booking.productImage || null,
      color_name: booking.colorName,
      color_hex: booking.colorHex || null,
      size: booking.size,
      quantity: booking.quantity,
      unit_price: unitPr,
      total_amount: totalAmt,
      payment_status: booking.paymentStatus || 'Reservation',
      payment_method: booking.paymentMethod || null,
      razorpay_payment_id: booking.razorpayPaymentId || null,
      razorpay_order_id: booking.razorpayOrderId || null,
      paid_at: booking.paidAt || null,
      booking_status: bStatus,
      shipping_address: shipping,
      admin_notes: booking.adminNotes || null,
      created_at: booking.createdAt,
      updated_at: booking.updatedAt,
    };

    const { error } = await supabase.from('pre_bookings').insert(payload);
    if (error) {
      console.warn('Error inserting pre_booking in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception creating pre_booking in Supabase:', err);
    return false;
  }
}

/**
 * UPDATE PRE-BOOKING IN SUPABASE
 */
export async function updatePreBookingInSupabase(
  id: string,
  updates: Partial<PreBooking>
): Promise<boolean> {
  try {
    const payload: any = {
      updated_at: new Date().toISOString(),
    };
    const bStatus = updates.status || updates.bookingStatus;
    if (bStatus) payload.booking_status = bStatus.toUpperCase();
    if (updates.paymentStatus) payload.payment_status = updates.paymentStatus;
    if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;
    if (updates.shippingAddress) payload.shipping_address = updates.shippingAddress;
    if (updates.carrierName !== undefined) payload.carrier_name = updates.carrierName;
    if (updates.trackingNumber !== undefined) payload.tracking_number = updates.trackingNumber;

    const { error } = await supabase
      .from('pre_bookings')
      .update(payload)
      .eq('id', id);

    return !error;
  } catch (err) {
    console.warn('Exception updating pre_booking in Supabase:', err);
    return false;
  }
}



