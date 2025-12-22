import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// This is the root layout required by Next.js
// The actual HTML structure is in app/[locale]/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'goDaz',
    template: '%s | goDaz',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
