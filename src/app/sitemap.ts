import { MetadataRoute } from 'next';
import { PRODUCTS } from '@/lib/data/products';
import { fetchProductsFromSupabase } from '@/lib/supabase/db';

const BASE_URL = 'https://supersnake.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // 1. Core Storefront Pages
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/men`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/women`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/unisex`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/new-drops`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/bestsellers`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  // 2. Collection Routes
  const collectionSlugs = ['oversized', 'boxy', 'relaxed', 'classic', 'heavyweight'];
  const collectionRoutes: MetadataRoute.Sitemap = collectionSlugs.map((slug) => ({
    url: `${BASE_URL}/collection/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. Editorial & Care Guides
  const guideRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/size-guide`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/care-guide`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 4. Policy & Legal Pages
  const policyRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/shipping`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/returns`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/cancellation`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/cookies`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/legal`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/grievance`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // 5. Dynamic Product Pages (Supabase with fallback to local PRODUCTS)
  let productsList = PRODUCTS;
  try {
    const remoteProducts = await fetchProductsFromSupabase();
    if (remoteProducts && remoteProducts.length > 0) {
      productsList = remoteProducts;
    }
  } catch (e) {
    console.warn('Sitemap Supabase fetch fallback to local products:', e);
  }

  const seenSlugs = new Set<string>();
  const productRoutes: MetadataRoute.Sitemap = [];

  for (const product of productsList) {
    if (!product.slug || seenSlugs.has(product.slug)) continue;
    seenSlugs.add(product.slug);

    productRoutes.push({
      url: `${BASE_URL}/product/${product.slug}`,
      lastModified: product.createdAt ? new Date(product.createdAt) : currentDate,
      changeFrequency: 'daily',
      priority: product.isSignature || product.isSpotlight ? 0.95 : 0.8,
    });
  }

  return [
    ...coreRoutes,
    ...collectionRoutes,
    ...productRoutes,
    ...guideRoutes,
    ...policyRoutes,
  ];
}
