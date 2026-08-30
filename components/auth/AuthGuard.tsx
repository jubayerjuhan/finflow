'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAppSelector((s) => s.auth.status);
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (status === 'unauthenticated' && !isLoginPage) {
      router.replace('/login');
    }
  }, [status, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return <DashboardSkeleton />;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}
