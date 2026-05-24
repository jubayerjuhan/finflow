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
  Wallet,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTheme, ThemeMode } from '@/store/slices/themeSlice';

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/transactions',  label: 'Transactions', icon: ArrowLeftRight },
  { href: '/upcoming',      label: 'Upcoming',     icon: CalendarClock },
  { href: '/reports',       label: 'Reports',      icon: BarChart3 },
  { href: '/budgets',       label: 'Budgets',      icon: Target },
  { href: '/settings',      label: 'Settings',     icon: Settings },
];

const themeOptions: { mode: ThemeMode; icon: React.ElementType; label: string }[] = [
  { mode: 'light',  icon: Sun,     label: 'Light'  },
  { mode: 'system', icon: Monitor, label: 'Auto'   },
  { mode: 'dark',   icon: Moon,    label: 'Dark'   },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const currentMode = useAppSelector((s) => (s as any).theme?.mode ?? 'system') as ThemeMode;

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col w-64 min-h-screen fixed left-0 top-0 bottom-0 z-40',
        // Apple frosted glass sidebar
        'bg-[rgba(242,242,247,0.82)] dark:bg-[rgba(18,18,20,0.82)]',
        'backdrop-blur-[40px] backdrop-saturate-200',
        'border-r border-black/8 dark:border-white/8',
      )}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-black/6 dark:border-white/6">
        <div className={cn(
          'w-9 h-9 rounded-[10px] flex items-center justify-center',
          'bg-primary',
          'shadow-[0_2px_8px_rgba(0,122,255,0.35)]',
        )}>
          <Wallet size={17} className="text-white" />
        </div>
        <div>
          <span className="text-[17px] font-bold tracking-tight text-foreground">FinFlow</span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                'text-[14px] font-medium',
                'transition-all duration-150',
                isActive
                  ? [
                      // Active: Apple Blue fill with subtle glow
                      'bg-primary text-white',
                      'shadow-[0_2px_8px_rgba(0,122,255,0.25)]',
                    ]
                  : [
                      'text-muted-foreground',
                      'hover:bg-black/5 dark:hover:bg-white/6',
                      'hover:text-foreground',
                      'active:scale-[0.98]',
                    ]
              )}
            >
              <Icon
                size={17}
                className={cn(
                  'shrink-0 transition-colors',
                  isActive ? 'text-white' : 'text-muted-foreground'
                )}
              />
              <span className="tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 py-4 border-t border-black/6 dark:border-white/6 space-y-3">
        {/* Apple-style segmented control for theme */}
        <div className={cn(
          'flex items-center gap-0.5 rounded-xl p-1',
          'bg-black/6 dark:bg-white/6',
        )}>
          {themeOptions.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => dispatch(setTheme(mode))}
              title={label}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5',
                'py-1.5 px-1 rounded-lg',
                'text-[11px] font-medium',
                'transition-all duration-150',
                currentMode === mode
                  ? 'bg-white dark:bg-white/15 text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon size={12} />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground px-1">FinFlow v1.0</p>
      </div>
    </aside>
  );
}
