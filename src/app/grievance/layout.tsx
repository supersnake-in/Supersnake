import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grievance Redressal Protocol',
  description: 'Designated grievance officer contact details and statutory complaint redressal mechanisms in accordance with the Consumer Protection (E-Commerce) Rules.',
  alternates: {
    canonical: 'https://supersnake.in/grievance',
  },
};

export default function GrievanceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
