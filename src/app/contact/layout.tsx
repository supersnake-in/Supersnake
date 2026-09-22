import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Atelier Concierge',
  description: 'Reach out to the SuperSnake client concierge for assistance with orders, sizing inquiries, or defect assessments.',
  alternates: {
    canonical: 'https://supersnake.in/contact',
  },
  openGraph: {
    title: 'Contact Atelier Concierge | SUPERSNAKE',
    description: 'Reach out to the SuperSnake client concierge for assistance with orders or sizing inquiries.',
    url: 'https://supersnake.in/contact',
    siteName: 'SUPERSNAKE',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
