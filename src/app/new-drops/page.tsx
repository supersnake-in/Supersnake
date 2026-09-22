import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Drops & Limited Runs',
  description: 'The latest limited runs and atelier releases from SuperSnake. Heavyweight luxury cotton, limited batch quantities.',
  alternates: {
    canonical: 'https://supersnake.in/new-drops',
  },
  openGraph: {
    title: 'New Drops & Limited Runs | SUPERSNAKE',
    description: 'The latest limited runs and atelier releases from SuperSnake.',
    url: 'https://supersnake.in/new-drops',
    siteName: 'SUPERSNAKE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'New Drops & Limited Runs | SUPERSNAKE',
    description: 'The latest limited runs and atelier releases from SuperSnake.',
  },
};

export default function NewDropsPage() {
  return (
    <ShopCatalog
      initialIsNew={true}
      pageTitle="NEW DROPS"
      pageSubtitle="Limited seasonal runs. Once an edition sells out, it enters the permanent archive."
    />
  );
}
