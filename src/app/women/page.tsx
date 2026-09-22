import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Women’s Luxury Heavyweight T-Shirts',
  description: 'Engineered boxy crop hems and fluid Supima-silk blends for women. Architectural proportions crafted from 240–280 GSM cotton.',
  alternates: {
    canonical: 'https://supersnake.in/women',
  },
  openGraph: {
    title: 'Women’s Luxury Heavyweight T-Shirts | SUPERSNAKE',
    description: 'Engineered boxy crop hems and fluid Supima-silk blends for women.',
    url: 'https://supersnake.in/women',
    siteName: 'SUPERSNAKE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Women’s Luxury Heavyweight T-Shirts | SUPERSNAKE',
    description: 'Engineered boxy crop hems and fluid Supima-silk blends for women.',
  },
};

export default function WomenPage() {
  return (
    <ShopCatalog
      initialGender="women"
      pageTitle="WOMEN’S T-SHIRTS"
      pageSubtitle="Engineered boxy crop hems, fluid Supima-silk blends, and architectural geometry."
    />
  );
}
