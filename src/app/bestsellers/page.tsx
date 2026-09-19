'use client';

import { ShopCatalog } from '@/components/shop/ShopCatalog';

export default function BestsellersPage() {
  return (
    <ShopCatalog
      initialIsBestseller={true}
      pageTitle="BESTSELLERS"
      pageSubtitle="The ones they keep coming back for. Tested, proven, and endlessly worn."
    />
  );
}
