import { NextResponse } from 'next/server';
import { sanitizeString, sanitizeSlug, sanitizeNumber, isValidImageSource } from '@/lib/security';
import { Product, ProductImage } from '@/lib/types';
import { PRODUCTS } from '@/lib/data/products';

export async function GET() {
  return NextResponse.json({
    success: true,
    products: PRODUCTS,
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
          .map((img: any, idx: number) => ({
            url: typeof img === 'string' ? img : img.url,
            alt: sanitizeString(typeof img === 'string' ? `${cleanName} view` : img.alt || `${cleanName} view ${idx + 1}`),
            isPrimary: idx === 0,
            angle: (idx === 0 ? 'front' : idx === 1 ? 'model' : 'fabric') as any,
          }))
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
    const allowedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const cleanSizes = Array.isArray(sizes) && sizes.length > 0
      ? sizes.filter((s: any) => allowedSizes.includes(s))
      : ['S', 'M', 'L', 'XL'];

    // Generate variant matrix
    const variants = cleanColors.flatMap((c) =>
      cleanSizes.map((s) => ({
        id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sku: `SS-${cleanName.slice(0, 3).toUpperCase()}-${c.name.slice(0, 3).toUpperCase()}-${s}`,
        colorName: c.name,
        colorHex: c.hex,
        size: s as any,
        stock: 25,
        price: cleanPrice,
        mrp: cleanMrp,
      }))
    );

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: cleanName,
      slug: cleanSlug,
      tagline: sanitizeString(tagline || 'Engineered heavyweight luxury garment.'),
      description: sanitizeString(
        description || 'Constructed from premium heavyweight long-staple cotton with architectural drape.'
      ),
      gender: ['men', 'women', 'unisex'].includes(gender) ? gender : 'unisex',
      fit: ['Boxy', 'Oversized', 'Relaxed', 'Classic'].includes(fit) ? fit : 'Boxy',
      price: cleanPrice,
      mrp: cleanMrp,
      gsm: cleanGsm,
      fabric: sanitizeString(fabric || `${cleanGsm} GSM Long-Staple Cotton`),
      careInstructions: [
        'Machine wash cold, inside out with like colors',
        'Do not tumble dry',
        'Lay flat to dry in shade',
      ],
      features: [
        `${cleanGsm} GSM Heavyweight structure`,
        'Zero-sag reinforced 1-inch collar',
        'Pre-shrunk architectural geometry',
      ],
      images: cleanImages,
      colors: cleanColors,
      sizes: cleanSizes as any,
      variants,
      isNew: true,
      rating: 5.0,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
    };

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
