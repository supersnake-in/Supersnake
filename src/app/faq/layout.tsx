import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers regarding SuperSnake orders, dispatches, 4–7 business days delivery, care instructions, and defect reporting protocols.',
  alternates: {
    canonical: 'https://supersnake.in/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions | SUPERSNAKE',
    description: 'Find answers regarding SuperSnake orders, dispatches, delivery, care instructions, and defect protocols.',
    url: 'https://supersnake.in/faq',
    siteName: 'SUPERSNAKE',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
