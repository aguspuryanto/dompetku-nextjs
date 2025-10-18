// src/app/providers.tsx
'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { TransactionProvider } from '@/contexts/TransactionContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TransactionProvider>
        {children}
      </TransactionProvider>
    </ThemeProvider>
  );
}