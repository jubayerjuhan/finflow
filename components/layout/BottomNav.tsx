'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CalendarClock,
  BarChart3,
  Target,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',    label: 'Home',      icon: LayoutDashboard },
  { href: '/transactions', label: 'Txns',      icon: ArrowLeftRight },
  { href: '/upcoming',     label: 'Upcoming',  icon: CalendarClock },
  { href: '/reports',      label: 'Reports',   icon: BarChart3 },
  { href: '/budgets',      label: 'Budgets',   icon: Target },
  { href: '/settings',     label: 'More',      icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 md:hidden',
        // iOS tab bar — frosted glass
        'bg-[rgba(242,242,247,0.82)] dark:bg-[rgba(18,18,20,0.82)]',
        'backdrop-blur-[40px] backdrop-saturate-200',
        'border-t border-black/8 dark:border-white/8',
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-1 pt-1.5 pb-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5',
                'px-2.5 py-1 rounded-xl',
                'min-w-[48px]',
                'transition-all duration-150',
                'active:scale-[0.90]',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {/* Icon with subtle fill indicator */}
              <div className={cn(
                'flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150',
                isActive && 'bg-primary/12 dark:bg-primary/20',
              )}>
                <Icon
                  size={20}
                  className={cn(
                    'transition-all duration-150',
                    isActive
                      ? 'text-primary scale-105'
                      : 'text-muted-foreground scale-100',
                  )}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </div>
              <span className={cn(
                'text-[10px] font-medium tracking-tight',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
