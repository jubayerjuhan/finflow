'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopBar from './TopBar';
import ThemeProvider from '@/components/providers/ThemeProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import AuthGuard from '@/components/auth/AuthGuard';
import axiosInstance from '@/lib/axios';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchWallets } from '@/store/slices/walletsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const authStatus = useAppSelector((s) => s.auth.status);
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (authStatus !== 'authenticated') return;

    const seedAndFetch = async () => {
      try {
        await axiosInstance.post('/seed');
      } catch {}
      dispatch(fetchWallets());
      dispatch(fetchCategories());
    };
    seedAndFetch();
  }, [authStatus, dispatch]);

  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <AuthGuard>
            {isLoginPage ? (
              children
            ) : (
              <>
                <Sidebar />
                <TopBar />
                <main className="md:pl-64 pb-24 md:pb-0 min-h-screen">
                  {children}
                </main>
                <BottomNav />
              </>
            )}
          </AuthGuard>

          {/* Apple-style toast notifications */}
          <Toaster
            position="top-center"
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '14px',
                padding: '12px 18px',
                // Frosted glass toast
                background: 'rgba(50, 50, 52, 0.90)',
                color: '#FFFFFF',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '0.5px solid rgba(255,255,255,0.12)',
                boxShadow:
                  '0 8px 30px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.12)',
                maxWidth: '320px',
              },
              success: {
                iconTheme: {
                  primary: '#34C759',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#FF3B30',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}
