import { Product } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'THE SIGNATURE TEE',
    slug: 'the-signature-tee',
    tagline: 'The definitive luxury heavyweight tee. Built for presence.',
    description: 'Constructed from 280 GSM long-staple Supima® cotton, the Signature Tee represents the pinnacle of daily luxury. Featuring a structured boxy silhouette, a 1-inch reinforced ribbed collar that never sags, and blind-stitched hems for a razor-clean finish.',
    gender: 'unisex',
    fit: 'Boxy',
    price: 1499,
    mrp: 2499,
    gsm: 280,
    fabric: '100% Long-Staple Supima® Cotton (280 GSM Heavyweight)',
    careInstructions: [
      'Machine wash cold, inside out with like colors',
      'Do not bleach or tumble dry',
      'Lay flat to dry in shade',
      'Cool iron inside out if needed',
    ],
    features: [
      '280 GSM Heavyweight combed cotton',
      'Zero-sag reinforced 1-inch collar',
      'Pre-shrunk to retain structural geometry',
      'Subtle tonal SuperSnake nape embroidery',
      'Dyed with non-toxic OEKO-TEX® certified reactive dyes',
    ],
    images: [
      {
        url: '/hero2.png',
        alt: 'THE SIGNATURE TEE - front',
        isPrimary: true,
        angle: 'front',
      },
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#0a0a0a' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { id: 'v1-1', sku: 'SS-SIG-BLK-S', colorName: 'Obsidian Black', colorHex: '#0a0a0a', size: 'S', stock: 24, price: 1499, mrp: 2499 },
      { id: 'v1-2', sku: 'SS-SIG-BLK-M', colorName: 'Obsidian Black', colorHex: '#0a0a0a', size: 'M', stock: 45, price: 1499, mrp: 2499 },
      { id: 'v1-3', sku: 'SS-SIG-BLK-L', colorName: 'Obsidian Black', colorHex: '#0a0a0a', size: 'L', stock: 32, price: 1499, mrp: 2499 },
      { id: 'v1-4', sku: 'SS-SIG-BLK-XL', colorName: 'Obsidian Black', colorHex: '#0a0a0a', size: 'XL', stock: 18, price: 1499, mrp: 2499 },
    ],
    isSpotlight: true,
    isSignature: true,
    isBestseller: true,
    isNew: false,
    collectionId: 'col-the-signature',
    collectionSlug: 'the-signature',
    collectionName: 'THE SIGNATURE',
    rating: 4.9,
    reviewsCount: 184,
    createdAt: '2026-08-01',
  },
  {
    id: '200b3e49-87b5-41e6-aef7-1701c71f75b8',
    name: 'THE ROYAL INSIGNIA',
    slug: 'the-royal-insignia',
    tagline: 'Signature Royal Embroidery',
    description: 'Royal heritage meets modern identity in this refined expression of understated luxury. Crafted from premium 100% Supima® cotton, this T-shirt offers a naturally soft, breathable feel in a timeless unisex regular-fit silhouette. The front features the SuperSnake wordmark in signature gold embroidery, complemented by an ornate royal gada motif on the right sleeve and the original SuperSnake emblem embroidered on the upper back. Inspired by regal Indian aesthetics and reinterpreted through contemporary streetwear, its considered detailing creates a distinctive yet versatile look. Pair it with relaxed denim, baggy trousers or everyday essentials for a confident style that balances heritage-inspired artistry with modern sophistication.',
    gender: 'unisex',
    fit: 'Classic',
    price: 1499,
    mrp: 3499,
    gsm: 280,
    fabric: '100% Supima® Cotton',
    careInstructions: [
      'Wash inside out in cold water',
      'Use a mild detergent',
      'Wash with similar colours',
      'Tumble dry on low heat',
      'Turn inside out before ironing',
      'Avoid direct ironing over the embroidery',
      'Do not bleach',
    ],
    features: [
      'Premium Supima® cotton T-shirt with a soft, breathable feel',
      'Unisex regular-fit T-shirt designed for everyday comfort',
      'Signature SuperSnake wordmark in intricate gold embroidery',
      'Ornate royal gada embroidery on the right sleeve',
      'Distinctive SuperSnake emblem embroidered on the upper back',
      'Luxury embroidered streetwear inspired by royal Indian aesthetics',
      'Classic crew-neck T-shirt with a clean, versatile silhouette',
      'Premium everyday wear designed for modern streetwear styling',
    ],
    images: [],
    colors: [
      { hex: '#030659', name: 'Midnight Sovereign' },
      { hex: '#5d0404', name: 'Imperial Oxblood' },
      { hex: '#ffffff', name: 'Royal Porcelain' },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XS', 'XXL', '3XL', '4XL', '5XL'],
    variants: [],
    isSpotlight: false,
    isSignature: false,
    isBestseller: true,
    isNew: true,
    collectionId: 'a0000000-0000-0000-0000-000000000002',
    collectionSlug: 'the-royals',
    collectionName: 'THE ROYALS',
    rating: 5,
    reviewsCount: 0,
    createdAt: '2026-10-12T13:50:19.421747+00:00',
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getSignatureProduct(): Product | undefined {
  return PRODUCTS.find((p) => p.isSignature);
}

export function getSpotlightProduct(): Product {
  return PRODUCTS.find((p) => p.isSignature) || PRODUCTS.find((p) => p.isSpotlight) || PRODUCTS[0];
}

export function getBestsellers(): Product[] {
  return PRODUCTS.filter((p) => p.isBestseller);
}

export function getNewDrops(): Product[] {
  return PRODUCTS.filter((p) => p.isNew);
}

export function getProductsByCollection(collectionSlug: string): Product[] {
  return PRODUCTS.filter((p) => p.collectionSlug === collectionSlug);
}
