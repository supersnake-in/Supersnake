import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Men’s Luxury Heavyweight T-Shirts',
  description: 'Heavyweight boxy and oversized cuts for men. Built from 260–300 GSM Supima® and French Terry cotton with zero-sag collars.',
  alternates: {
    canonical: 'https://supersnake.in/men',
  },
  openGraph: {
    title: 'Men’s Luxury Heavyweight T-Shirts | SUPERSNAKE',
    description: 'Heavyweight boxy and oversized cuts for men. Built from 260–300 GSM Supima® and French Terry cotton.',
    url: 'https://supersnake.in/men',
    siteName: 'SUPERSNAKE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Men’s Luxury Heavyweight T-Shirts | SUPERSNAKE',
    description: 'Heavyweight boxy and oversized cuts for men. Built from 260–300 GSM Supima® and French Terry cotton.',
  },
};

export default function MenPage() {
  return (
    <ShopCatalog
      initialGender="men"
      pageTitle="MEN’S T-SHIRTS"
      pageSubtitle="Monolithic proportions, dropped shoulders, and uncompromising heavyweight drape."
    />
  );
}
