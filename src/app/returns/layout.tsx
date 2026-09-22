import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Defects Protocol',
  description: 'SuperSnake strict no-return policy for ordinary purchases, defect reporting procedures, and replacement guidelines.',
  alternates: {
    canonical: 'https://supersnake.in/returns',
  },
  openGraph: {
    title: 'Returns & Defects Protocol | SUPERSNAKE',
    description: 'SuperSnake strict no-return policy for ordinary purchases, defect reporting, and replacement guidelines.',
    url: 'https://supersnake.in/returns',
    siteName: 'SUPERSNAKE',
  },
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
