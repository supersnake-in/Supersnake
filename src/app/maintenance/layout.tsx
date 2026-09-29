import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Atelier Under Curation — SuperSnake',
  description:
    'SuperSnake digital atelier is currently undergoing scheduled enhancements. Storefront will return shortly.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
