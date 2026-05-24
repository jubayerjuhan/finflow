'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ThemeProvider from '@/components/providers/ThemeProvider';
import { useAppDispatch } from '@/store/hooks';
import { fetchWallets } from '@/store/slices/walletsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Seed data on first load, then fetch
    const seedAndFetch = async () => {
      try {
        await fetch('/api/seed', { method: 'POST' });
      } catch {}
      dispatch(fetchWallets());
      dispatch(fetchCategories());
    };
    seedAndFetch();
  }, [dispatch]);

  return (
    <ThemeProvider>
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:pl-64 pb-24 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
    </ThemeProvider>
  );
}
