import { supabase } from './client';
import { Product, Order, ProductVariant, ProductImage, HomepageConfig } from '../types';

/**
 * FETCH PRODUCTS DYNAMICALLY FROM SUPABASE
 */
export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  try {
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        variants:product_variants(*)
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
    return productsData.map((row: any): Product => {
      const images: ProductImage[] = (row.images || []).map((img: any) => ({
        url: img.url,
        alt: img.alt || row.name,
        angle: img.angle,
        isPrimary: img.display_order === 0,
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

      const colors = Array.from(
        new Map(variants.map((v) => [v.colorName, { name: v.colorName, hex: v.colorHex }])).values()
      );

      const sizes = Array.from(new Set(variants.map((v) => v.size)));

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
        careInstructions: row.care_instructions || [],
        features: row.features || [],
        images: images.length > 0 ? images : [
          {
            url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1600&auto=format&fit=crop',
            alt: row.name,
            isPrimary: true,
            angle: 'front',
          },
        ],
        colors: colors.length > 0 ? colors : [{ name: 'Obsidian Black', hex: '#0a0a0a' }],
        sizes: sizes.length > 0 ? (sizes as any) : ['S', 'M', 'L', 'XL'],
        variants,
        isNew: row.is_new,
        isBestseller: row.is_bestseller,
        isSpotlight: row.is_spotlight,
        rating: Number(row.rating || 5.0),
        reviewsCount: Number(row.reviews_count || 0),
        createdAt: row.created_at || new Date().toISOString(),
      };
    });
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
    // 1. Insert product row
    const { data: insertedProduct, error: productError } = await supabase
      .from('products')
      .insert({
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
        care_instructions: product.careInstructions,
        features: product.features,
        is_spotlight: Boolean(product.isSpotlight),
        is_bestseller: Boolean(product.isBestseller),
        is_new: Boolean(product.isNew),
        rating: product.rating,
        reviews_count: product.reviewsCount,
      })
      .select()
      .single();

    if (productError || !insertedProduct) {
      console.warn('Supabase product insert error:', productError);
      return false;
    }

    const productId = insertedProduct.id;

    // 2. Insert images
    if (product.images && product.images.length > 0) {
      const imageRows = product.images.map((img, idx) => ({
        product_id: productId,
        url: img.url,
        alt: img.alt,
        angle: img.angle || 'front',
        display_order: idx,
      }));
      await supabase.from('product_images').insert(imageRows);
    }

    // 3. Insert variants
    if (product.variants && product.variants.length > 0) {
      const variantRows = product.variants.map((v) => ({
        product_id: productId,
        sku: v.sku,
        color_name: v.colorName,
        color_hex: v.colorHex,
        size: v.size,
        stock: v.stock,
        price: v.price,
        mrp: v.mrp,
      }));
      await supabase.from('product_variants').insert(variantRows);
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
    const { error } = await supabase.from('products').delete().eq('id', productId);
    return !error;
  } catch (err) {
    return false;
  }
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
      .select()
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
 * FETCH ORDERS DYNAMICALLY FROM SUPABASE
 */
export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  try {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .order('created_at', { ascending: false });

    if (ordersError || !ordersData || ordersData.length === 0) {
      return null;
    }

    return ordersData.map((row: any): Order => ({
      id: row.id,
      orderNumber: row.order_number,
      createdAt: row.created_at,
      status: row.status,
      items: (row.items || []).map((it: any) => ({
        productId: it.product_id || '',
        productName: it.product_name,
        color: it.color,
        size: it.size,
        quantity: it.quantity,
        price: Number(it.price),
        imageUrl: it.image_url || '',
      })),
      subtotal: Number(row.subtotal),
      discount: Number(row.discount || 0),
      shipping: Number(row.shipping || 0),
      tax: Number(row.tax || 0),
      total: Number(row.total),
      customer: {
        name: row.customer_name,
        email: row.customer_email,
        phone: row.customer_phone,
      },
      shippingAddress: row.shipping_address || {},
      payment: {
        method: row.payment_method || 'card',
        transactionId: row.transaction_id || '',
        status: row.payment_status || 'paid',
        paidAt: row.created_at,
      },
      tracking: row.tracking_info,
    }));
  } catch (err) {
    console.warn('Error fetching orders from Supabase:', err);
    return null;
  }
}

/**
 * SUBSCRIBE NEWSLETTER IN SUPABASE
 */
export async function subscribeNewsletterInSupabase(email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email });
    return !error;
  } catch (err) {
    return false;
  }
}

/**
 * FETCH HOMEPAGE CONFIG FROM SUPABASE
 */
export async function fetchHomepageConfigFromSupabase(): Promise<HomepageConfig | null> {
  try {
    const { data, error } = await supabase
      .from('homepage_config')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) {
      return null;
    }

    return {
      heroImages: Array.isArray(data.hero_images) && data.hero_images.length > 0 ? data.hero_images : [],
      heroIntervalSeconds: Number(data.hero_interval_seconds || 3),
      heroHeadline: data.hero_headline || '',
      heroSupportingCopy: data.hero_supporting_copy || '',
      spotlightProductId: data.spotlight_product_id || '',
      brandStatement: data.brand_statement || '',
    };
  } catch (err) {
    console.warn('Supabase homepage config fetch failed:', err);
    return null;
  }
}

/**
 * SAVE HOMEPAGE CONFIG TO SUPABASE
 */
export async function saveHomepageConfigToSupabase(config: HomepageConfig): Promise<boolean> {
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

