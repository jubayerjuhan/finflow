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
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/upcoming', label: 'Upcoming', icon: CalendarClock },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const themeOptions: { mode: ThemeMode; icon: React.ElementType; label: string }[] = [
  { mode: 'light', icon: Sun, label: 'Light' },
  { mode: 'system', icon: Monitor, label: 'System' },
  { mode: 'dark', icon: Moon, label: 'Dark' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const currentMode = useAppSelector((s) => (s as any).theme?.mode ?? 'system') as ThemeMode;

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen border-r border-border bg-background fixed left-0 top-0 bottom-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Wallet size={18} className="text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight">FinFlow</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border space-y-3">
        {/* Theme toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          {themeOptions.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => dispatch(setTheme(mode))}
              title={label}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                currentMode === mode
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon size={13} />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">FinFlow v1.0</p>
      </div>
    </aside>
  );
}
