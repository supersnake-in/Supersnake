import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions governing the use of SuperSnake website and purchase of atelier apparel.',
  alternates: {
    canonical: 'https://supersnake.in/terms',
  },
  openGraph: {
    title: 'Terms of Service | SUPERSNAKE',
    description: 'Terms and conditions governing the use of SuperSnake.',
    url: 'https://supersnake.in/terms',
    siteName: 'SUPERSNAKE',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
