import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unisex Premium Heavyweight T-Shirts | SUPERSNAKE',
  description: 'Architectural silhouettes and versatile heavyweight draping designed for every form. Built from 240–300 GSM Supima® cotton.',
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
