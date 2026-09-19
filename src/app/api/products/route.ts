import { NextResponse } from 'next/server';
import { sanitizeString, sanitizeSlug, sanitizeNumber, isValidImageSource } from '@/lib/security';
import { Product, ProductImage } from '@/lib/types';
import { fetchProductsFromSupabase, createProductInSupabase } from '@/lib/supabase/db';

export async function GET() {
  const products = await fetchProductsFromSupabase();
  return NextResponse.json({
    success: true,
    products: products || [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      tagline,
      description,
      gender,
      fit,
      price,
      mrp,
      gsm,
      fabric,
      weightText,
      careInstructions,
      features,
      shippingPolicy,
      images,
      colors,
      sizes,
    } = body;

    // Strict Validations
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const cleanName = sanitizeString(name);
    const cleanSlug = sanitizeSlug(cleanName);
    const cleanPrice = sanitizeNumber(price, 1499);
    const cleanMrp = sanitizeNumber(mrp, Math.max(cleanPrice, 2499));
    const cleanGsm = sanitizeNumber(gsm, 280);

    // Validate images
    const cleanImages: ProductImage[] = Array.isArray(images)
      ? images
          .filter((img: any) => img && (typeof img === 'string' ? isValidImageSource(img) : isValidImageSource(img.url)))
          .map((img: any, idx: number) => {
            const url = typeof img === 'string' ? img : img.url;
            const rawAngle = (typeof img === 'object' && img.angle ? img.angle : (idx === 0 ? 'front' : idx === 1 ? 'model' : idx === 2 ? 'fabric' : 'detail')).toLowerCase();
            const angle = ['front', 'back', 'detail', 'model', 'fabric', 'studio', 'side'].includes(rawAngle)
              ? rawAngle
              : 'front';
            return {
              url,
              alt: sanitizeString(typeof img === 'string' ? `${cleanName} view ${idx + 1}` : img.alt || `${cleanName} view ${idx + 1}`),
              isPrimary: idx === 0,
              angle: angle as any,
            };
          })
      : [];

    if (cleanImages.length === 0) {
      cleanImages.push({
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1600&auto=format&fit=crop',
        alt: `${cleanName} - Front View`,
        isPrimary: true,
        angle: 'front',
      });
    }

    // Colors
    const cleanColors = Array.isArray(colors) && colors.length > 0
      ? colors.map((c: any) => ({
          name: sanitizeString(c.name || 'Obsidian Black'),
          hex: sanitizeString(c.hex || '#0a0a0a'),
        }))
      : [{ name: 'Obsidian Black', hex: '#0a0a0a' }];

    // Sizes
    const allowedSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL'];
    const cleanSizes = Array.isArray(sizes) && sizes.length > 0
      ? sizes.filter((s: any) => allowedSizes.includes(s))
      : ['S', 'M', 'L', 'XL'];

    // Generate variant matrix
    const variants = cleanColors.flatMap((c) =>
      cleanSizes.map((s, idx) => ({
        id: `v-${Date.now()}-${idx}`,
        sku: `SS-${cleanSlug.slice(0, 6).toUpperCase()}-${c.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()}-${s}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        colorName: c.name,
        colorHex: c.hex,
        size: s as any,
        stock: 25,
        price: cleanPrice,
        mrp: cleanMrp,
      }))
    );

    const newProduct: Product = {
      id: body.id || `prod-${Date.now()}`,
      name: cleanName,
      slug: cleanSlug,
      tagline: sanitizeString(tagline || 'Engineered heavyweight luxury garment.'),
      description: sanitizeString(
        description || 'Constructed from premium heavyweight long-staple cotton with architectural drape.'
      ),
      gender: ['men', 'women', 'unisex'].includes(gender) ? gender : 'unisex',
      fit: ['Boxy', 'Oversized', 'Relaxed', 'Classic', 'Slim'].includes(fit) ? fit : 'Boxy',
      price: cleanPrice,
      mrp: cleanMrp,
      gsm: cleanGsm,
      fabric: sanitizeString(fabric || `${cleanGsm} GSM Long-Staple Cotton`),
      weightText: typeof weightText === 'string' ? sanitizeString(weightText) : undefined,
      careInstructions: Array.isArray(careInstructions)
        ? careInstructions.map((c: any) => sanitizeString(String(c))).filter(Boolean)
        : [
            'Machine wash cold, inside out with like colors',
            'Do not tumble dry',
            'Lay flat to dry in shade',
          ],
      features: Array.isArray(features)
        ? features.map((f: any) => sanitizeString(String(f))).filter(Boolean)
        : [
            `${cleanGsm} GSM Heavyweight structure`,
            'Zero-sag reinforced 1-inch collar',
            'Pre-shrunk architectural geometry',
          ],
      shippingPolicy: typeof shippingPolicy === 'string' ? sanitizeString(shippingPolicy) : undefined,
      images: cleanImages,
      colors: cleanColors,
      sizes: cleanSizes as any,
      variants,
      isNew: true,
      rating: 5.0,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Background sync to Supabase
    try {
      await createProductInSupabase(newProduct);
    } catch (e) {
      console.warn('API background Supabase sync warning:', e);
    }

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'Product created and validated securely',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process product' },
      { status: 500 }
    );
  }
}
