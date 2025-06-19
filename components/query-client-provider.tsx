'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import queryClient from '@/lib/queryClient';

interface ClientQueryProviderProps {
  children: React.ReactNode;
}

const ClientQueryProvider = ({ children }: ClientQueryProviderProps) => {
  // Khởi tạo QueryClient ở phía client
  const [queryClientState] = useState(() => queryClient);

  return (
    <QueryClientProvider client={queryClientState}>
      {children}
    </QueryClientProvider>
  );
};

export default ClientQueryProvider;
