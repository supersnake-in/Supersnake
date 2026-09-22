import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report Damaged or Defective Product',
  description: 'Submit an official damage or defect complaint with order verification, item selection, and photographic or video evidence.',
  alternates: {
    canonical: 'https://supersnake.in/returns/report',
  },
};

export default function ReportDefectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
