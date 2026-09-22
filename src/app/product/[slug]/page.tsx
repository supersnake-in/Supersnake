import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS } from '@/lib/data/products';
import { fetchProductsFromSupabase } from '@/lib/supabase/db';
import { Product } from '@/lib/types';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';
import { JsonLd } from '@/components/seo/JsonLd';

interface Props {
  params: { slug: string };
}

async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supaProducts = await fetchProductsFromSupabase();
    const found = supaProducts?.find((p) => p.slug === slug);
    if (found) return found;
  } catch (e) {
    console.warn('Supabase fetch failed in product page, falling back to local data:', e);
  }
  return PRODUCTS.find((p) => p.slug === slug) || null;
}

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested SuperSnake piece could not be located in our catalog.',
    };
  }

  const title = `${product.name} — ${product.tagline || `${product.gsm} GSM Luxury Heavyweight Tee`}`;
  const description = `${product.description} Cut from ${product.fabric || `${product.gsm} GSM heavyweight cotton`}. Available in ${product.colors.map((c) => c.name).join(', ')}.`;
  const primaryImage = product.images?.[0]?.url || 'https://supersnake.in/logo.png';
  const canonicalUrl = `https://supersnake.in/product/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} | SUPERSNAKE`,
      description,
      url: canonicalUrl,
      siteName: 'SUPERSNAKE',
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 1000,
          alt: `${product.name} — Luxury Heavyweight T-Shirt`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | SUPERSNAKE`,
      description,
      images: [primaryImage],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const primaryImage = product.images?.[0]?.url || 'https://supersnake.in/logo.png';
  const allImages = product.images?.map((img) => img.url).filter(Boolean) || [primaryImage];

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: allImages,
    description: product.description,
    sku: product.variants?.[0]?.sku || product.id,
    mpn: product.id,
    brand: {
      '@type': 'Brand',
      name: 'SuperSnake',
    },
    offers: {
      '@type': 'Offer',
      url: `https://supersnake.in/product/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'SuperSnake',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 4.9,
      reviewCount: product.reviewsCount || 120,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://supersnake.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'T-Shirts',
        item: 'https://supersnake.in/shop',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.gender.toUpperCase(),
        item: `https://supersnake.in/${product.gender}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `https://supersnake.in/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ProductDetailClient initialProduct={product} slug={params.slug} />
    </>
  );
}
