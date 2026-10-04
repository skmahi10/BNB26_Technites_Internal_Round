import type { Metadata } from 'next';
import '@xyflow/react/dist/style.css';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'ModelLedger — Model trust & provenance',
  description: 'Model provenance, testing, lifecycle, and verification workspace.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
