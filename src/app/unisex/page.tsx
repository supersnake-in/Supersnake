import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unisex Heavyweight T-Shirts',
  description: 'Architectural silhouettes and versatile heavyweight draping designed for every form. Built from 240–300 GSM Supima® cotton.',
  alternates: {
    canonical: 'https://supersnake.in/unisex',
  },
  openGraph: {
    title: 'Unisex Heavyweight T-Shirts | SUPERSNAKE',
    description: 'Architectural silhouettes and versatile heavyweight draping designed for every form.',
    url: 'https://supersnake.in/unisex',
    siteName: 'SUPERSNAKE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unisex Heavyweight T-Shirts | SUPERSNAKE',
    description: 'Architectural silhouettes and versatile heavyweight draping designed for every form.',
  },
};

export default function UnisexPage() {
  return (
    <ShopCatalog
      initialGender="unisex"
      pageTitle="UNISEX T-SHIRTS"
      pageSubtitle="Architectural silhouettes and versatile heavyweight draping designed for every form. Built from 240–300 GSM Supima® cotton."
    />
  );
}
