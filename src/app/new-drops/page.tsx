import { ShopCatalog } from '@/components/shop/ShopCatalog';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Drops | SUPERSNAKE',
  description: 'The latest limited runs and atelier releases from SuperSnake.',
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
