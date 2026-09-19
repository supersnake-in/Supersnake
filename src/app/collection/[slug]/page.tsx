'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { FitType } from '@/lib/types';

const COLLECTION_MAP: Record<string, { title: string; subtitle: string; fit?: FitType; isNew?: boolean; isBestseller?: boolean }> = {
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

export default function CollectionPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'heavyweight';
  const config = COLLECTION_MAP[slug] || {
    title: `${slug.toUpperCase().replace('-', ' ')} COLLECTION`,
    subtitle: 'Curated limited releases from the SuperSnake atelier.',
  };

  return (
    <ShopCatalog
      initialFit={config.fit || 'all'}
      initialIsNew={config.isNew}
      initialIsBestseller={config.isBestseller}
      pageTitle={config.title}
      pageSubtitle={config.subtitle}
    />
  );
}
