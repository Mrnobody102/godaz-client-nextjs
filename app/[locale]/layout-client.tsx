'use client';

import { ReactNode, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import queryClient from '@/lib/queryClient';

const hashTitleMap: Record<string, string> = {
  '#home': 'Trang Chủ',
  '#products': 'Sản Phẩm',
  '#about': 'Giới Thiệu',
  '#contact': 'Liên Hệ',
};

export function LayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const baseTitle = document.title || 'goDaz';

    const applyTitleForHash = () => {
      const section = window.location.hash.toLowerCase();
      const sectionTitle = hashTitleMap[section];

      if (sectionTitle) {
        document.title = `${sectionTitle} | goDaz`;
      } else {
        document.title = baseTitle;
      }
    };

    applyTitleForHash();
    window.addEventListener('hashchange', applyTitleForHash);

    return () => {
      window.removeEventListener('hashchange', applyTitleForHash);
    };
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
