'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchWallets } from '@/store/slices/walletsSlice';
import { fetchTransactions } from '@/store/slices/transactionsSlice';
import { fetchUpcoming } from '@/store/slices/upcomingSlice';
import WalletCard from '@/components/dashboard/WalletCard';
import TransactionItem from '@/components/shared/TransactionItem';
import { WalletCardSkeleton, TransactionSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, ArrowRight, CalendarClock, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { items: wallets, loading: walletsLoading } = useAppSelector((s) => s.wallets);
  const { items: transactions, loading: txLoading } = useAppSelector((s) => s.transactions);
  const { items: upcoming } = useAppSelector((s) => s.upcoming);

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchWallets());
    dispatch(fetchTransactions({ limit: 10, page: 1 }));
    dispatch(fetchUpcoming());
  }, [dispatch]);

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const pendingUpcoming = upcoming
    .filter((u) => u.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const recentTransactions = transactions.slice(0, 8);

  const now = new Date();
  const currentMonthTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthIncome = currentMonthTx
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const monthExpenses = currentMonthTx
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount + (t.fee ?? 0), 0);

  // ── Upcoming Bills panel (rendered in both mobile flow & desktop sidebar) ──
  const upcomingPanel =
    pendingUpcoming.length > 0 ? (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <CalendarClock size={15} />
            Upcoming Bills
          </h2>
          <Link href="/upcoming">
            <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
              View all <ArrowRight size={12} className="ml-1" />
            </Button>
          </Link>
        </div>
        <Card className="border border-border">
          <CardContent className="p-0 divide-y divide-border">
            {pendingUpcoming.map((exp) => {
              const daysLeft = differenceInDays(new Date(exp.dueDate), new Date());
              const isOverdue = daysLeft < 0;
              const isUrgent = daysLeft <= 2 && !isOverdue;
              return (
                <div key={exp._id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xl">{exp.categoryId?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{exp.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(exp.dueDate), 'MMM d')} · {exp.walletId?.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold">
                      ৳{exp.amount.toLocaleString()}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] py-0 px-1.5 h-4',
                        isOverdue && 'border-red-500 text-red-500',
                        isUrgent && 'border-amber-500 text-amber-500',
                        !isOverdue &&
                          !isUrgent &&
                          'border-muted-foreground text-muted-foreground'
                      )}
                    >
                      {isOverdue ? 'Overdue' : daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    ) : null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-6 max-w-screen-xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <h1 className="text-3xl font-bold tracking-tight">
            ৳{totalBalance.toLocaleString()}
          </h1>
        </div>
        <Link href="/transactions/new">
          <Button size="icon" className="h-12 w-12 rounded-2xl shadow-lg">
            <Plus size={22} />
          </Button>
        </Link>
      </div>

      {/* ── Two-column grid on lg+, single column below ── */}
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">

        {/* ╔═══════════════ LEFT COLUMN ═══════════════╗ */}
        <div className="space-y-5 min-w-0">

          {/* Month Summary */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 bg-emerald-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Income</span>
                </div>
                <p className="text-xl font-bold text-emerald-600">
                  ৳{monthIncome.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-red-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown size={16} className="text-red-500" />
                  <span className="text-xs text-muted-foreground">Expenses</span>
                </div>
                <p className="text-xl font-bold text-red-500">
                  ৳{monthExpenses.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Wallets */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Wallet size={15} />
                My Wallets
              </h2>
              <Link href="/settings#wallets">
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                  Manage <ArrowRight size={12} className="ml-1" />
                </Button>
              </Link>
            </div>

            {walletsLoading ? (
              /* Skeleton: responsive grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <WalletCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              /* Cards: responsive grid on desktop, horizontal scroll on small mobile */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {wallets.map((wallet) => (
                  <WalletCard
                    key={wallet._id}
                    wallet={wallet}
                    isSelected={selectedWalletId === wallet._id}
                    onClick={() =>
                      setSelectedWalletId(
                        selectedWalletId === wallet._id ? null : wallet._id
                      )
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Bills — visible only on mobile/tablet (hidden on lg+) */}
          <div className="lg:hidden">{upcomingPanel}</div>

          {/* Recent Transactions */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">Recent Transactions</h2>
              <Link href="/transactions">
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                  View all <ArrowRight size={12} className="ml-1" />
                </Button>
              </Link>
            </div>
            <Card className="border border-border">
              <CardContent className="p-0">
                {txLoading ? (
                  <div className="divide-y divide-border">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TransactionSkeleton key={i} />
                    ))}
                  </div>
                ) : recentTransactions.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p className="text-sm">No transactions yet</p>
                    <Link href="/transactions/new">
                      <Button variant="link" size="sm" className="mt-1">
                        Add your first one
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentTransactions.map((tx) => (
                      <TransactionItem key={tx._id} transaction={tx} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
        {/* ╚═══════════════ END LEFT COLUMN ═══════════════╝ */}

        {/* ╔═══════════════ RIGHT COLUMN (lg+ only) ════════╗ */}
        <div className="hidden lg:block lg:sticky lg:top-6 space-y-5">
          {upcomingPanel}

          {/* Quick Stats summary card */}
          <Card className="border border-border">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold">This Month</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Transactions</span>
                  <span className="font-medium">{currentMonthTx.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Net flow</span>
                  <span
                    className={cn(
                      'font-medium',
                      monthIncome - monthExpenses >= 0
                        ? 'text-emerald-600'
                        : 'text-red-500'
                    )}
                  >
                    {monthIncome - monthExpenses >= 0 ? '+' : ''}
                    ৳{(monthIncome - monthExpenses).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active wallets</span>
                  <span className="font-medium">{wallets.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* ╚═══════════════ END RIGHT COLUMN ════════════════╝ */}

      </div>
    </div>
  );
}
