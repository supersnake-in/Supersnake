import { Metadata } from 'next';
import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { FitType, Gender } from '@/lib/types';

interface CollectionConfig {
  title: string;
  subtitle: string;
  fit?: FitType;
  isNew?: boolean;
  isBestseller?: boolean;
  gender?: Gender;
}

const COLLECTION_MAP: Record<string, CollectionConfig> = {
  unisex: {
    title: 'UNISEX COLLECTION',
    subtitle: 'Architectural silhouettes and versatile heavyweight draping designed for every form.',
    gender: 'unisex',
  },
  men: {
    title: 'MEN’S COLLECTION',
    subtitle: 'Heavyweight boxy and oversized cuts for men. Built from 260–300 GSM Supima® and French Terry.',
    gender: 'men',
  },
  women: {
    title: 'WOMEN’S COLLECTION',
    subtitle: 'Engineered boxy crop hems and fluid Supima-silk blends for women.',
    gender: 'women',
  },
  oversized: {
    title: 'OVERSIZED CAPSULE',
    subtitle: 'Exaggerated dropped shoulders and heavy drape. The definitive street silhouette.',
    fit: 'Oversized',
  },
  boxy: {
    title: 'BOXY CUTS',
    subtitle: 'Cropped body, broad chest, high collar. Automotive proportions in pure Supima.',
    fit: 'Boxy',
  },
  relaxed: {
    title: 'RELAXED ESSENTIALS',
    subtitle: 'Effortless everyday cut. Balanced proportions for day-to-night presence.',
    fit: 'Relaxed',
  },
  classic: {
    title: 'CLASSIC MONUMENTS',
    subtitle: 'Tailored athletic contour. Clean lines engineered to stay crisp forever.',
    fit: 'Classic',
  },
  heavyweight: {
    title: '280 GSM HEAVYWEIGHT',
    subtitle: 'Dense, substantial, and monolithic. Zero see-through, zero collar deformation.',
  },
};

export async function generateStaticParams() {
  return Object.keys(COLLECTION_MAP).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params?.slug || 'heavyweight';
  const config = COLLECTION_MAP[slug] || {
    title: `${slug.toUpperCase().replace(/-/g, ' ')} COLLECTION`,
    subtitle: 'Curated limited releases from the SuperSnake atelier.',
  };

  const title = `${config.title} | Luxury Heavyweight T-Shirts`;
  const description = `${config.subtitle} Engineered from 240–300 GSM combed Supima® cotton. Cut for monolithic drape.`;
  const canonicalUrl = `https://supersnake.in/collection/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${config.title} | SUPERSNAKE`,
      description,
      url: canonicalUrl,
      siteName: 'SUPERSNAKE',
      images: [
        {
          url: '/logo.png',
          width: 800,
          height: 1200,
          alt: `${config.title} by SUPERSNAKE`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.title} | SUPERSNAKE`,
      description,
    },
  };
}

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug || 'heavyweight';
  const config = COLLECTION_MAP[slug] || {
    title: `${slug.toUpperCase().replace(/-/g, ' ')} COLLECTION`,
    subtitle: 'Curated limited releases from the SuperSnake atelier.',
  };

  return (
    <ShopCatalog
      initialGender={config.gender || 'all'}
      initialFit={config.fit || 'all'}
      initialIsNew={config.isNew}
      initialIsBestseller={config.isBestseller}
      pageTitle={config.title}
      pageSubtitle={config.subtitle}
    />
  );
}
