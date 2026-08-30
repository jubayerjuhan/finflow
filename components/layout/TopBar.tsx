'use client';

import { usePathname } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import AccountMenu from './AccountMenu';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/upcoming': 'Upcoming',
  '/reports': 'Reports',
  '/budgets': 'Budgets',
  '/settings': 'Settings',
};

function titleForPath(pathname: string) {
  const match = Object.keys(PAGE_TITLES).find(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );
  return match ? PAGE_TITLES[match] : 'FinFlow';
}

export default function TopBar() {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 md:hidden',
        'flex items-center justify-between gap-3 px-4 py-3',
        'bg-[rgba(242,242,247,0.82)] dark:bg-[rgba(18,18,20,0.82)]',
        'backdrop-blur-[40px] backdrop-saturate-200',
        'border-b border-black/8 dark:border-white/8'
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-[8px] flex items-center justify-center bg-primary">
          <Wallet size={14} className="text-white" />
        </div>
        <span className="text-[16px] font-bold tracking-tight text-foreground">
          {titleForPath(pathname)}
        </span>
      </div>
      <AccountMenu />
    </header>
  );
}
