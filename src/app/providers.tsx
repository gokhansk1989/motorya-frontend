'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import { installErrorReporter } from '@/lib/errorReporter';
import { FeedbackWidget } from '@/components/ui/FeedbackWidget';

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  useEffect(() => {
    installErrorReporter();
  }, []);
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        {children}
        <FeedbackWidget />
        <Toaster position="top-right" toastOptions={{ className: 'text-sm' }} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
