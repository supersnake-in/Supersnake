import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Luxury Heavyweight T-Shirts',
  description: 'Explore the definitive SuperSnake catalog. Monolithic boxy and oversized cuts, crafted from 240–300 GSM Supima® and French Terry cotton.',
  alternates: {
    canonical: 'https://supersnake.in/shop',
  },
  openGraph: {
    title: 'Shop All Luxury Heavyweight T-Shirts | SUPERSNAKE',
    description: 'Explore the definitive SuperSnake catalog of 240–300 GSM luxury heavyweight T-shirts.',
    url: 'https://supersnake.in/shop',
    siteName: 'SUPERSNAKE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop All Luxury Heavyweight T-Shirts | SUPERSNAKE',
    description: 'Explore the definitive SuperSnake catalog of 240–300 GSM luxury heavyweight T-shirts.',
  },
};

export default function ShopPage() {
  return (
    <ShopCatalog
      initialGender="all"
      pageTitle="SHOP T-SHIRTS"
      pageSubtitle="The hero product. Engineered from 240–300 GSM long-staple cotton."
    />
  );
}
