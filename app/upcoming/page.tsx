'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchUpcoming,
  markUpcomingPaid,
  updateUpcoming,
  deleteUpcoming,
  UpcomingExpense,
} from '@/store/slices/upcomingSlice';
import { fetchWallets } from '@/store/slices/walletsSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, CheckCircle2, XCircle, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const RECURRING_LABELS: Record<string, string> = {
  none: '',
  weekly: '🔁 Weekly',
  monthly: '🔁 Monthly',
  yearly: '🔁 Yearly',
};

type SortKey = 'dueDate' | 'amount';
type SortDir = 'asc' | 'desc';
type FilterStatus = 'all' | 'pending' | 'paid' | 'skipped';

export default function UpcomingPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.upcoming);

  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    dispatch(fetchUpcoming());
  }, [dispatch]);

  const pending = items.filter((u) => u.status === 'pending');
  const paid = items.filter((u) => u.status === 'paid');
  const skipped = items.filter((u) => u.status === 'skipped');

  const totalPending = pending.reduce((s, u) => s + u.amount, 0);

  // Category breakdown (pending only)
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { name: string; icon: string; color: string; amount: number }> = {};
    for (const exp of pending) {
      const id = exp.categoryId?._id || 'unknown';
      if (!map[id]) {
        map[id] = {
          name: exp.categoryId?.name || 'Unknown',
          icon: exp.categoryId?.icon || '📦',
          color: exp.categoryId?.color || '#6366f1',
          amount: 0,
        };
      }
      map[id].amount += exp.amount;
    }
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [pending]);

  // Filtered + sorted list
  const displayedItems = useMemo(() => {
    let list = filterStatus === 'all' ? items : items.filter((u) => u.status === filterStatus);
    list = [...list].sort((a, b) => {
      if (sortKey === 'dueDate') {
        const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        return sortDir === 'asc' ? diff : -diff;
      } else {
        return sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });
    return list;
  }, [items, filterStatus, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const handlePay = async (exp: UpcomingExpense) => {
    try {
      await dispatch(markUpcomingPaid(exp._id)).unwrap();
      dispatch(fetchWallets());
      toast.success(`✅ Marked "${exp.title}" as paid!`);
    } catch {
      toast.error('Failed to mark as paid');
    }
  };

  const handleSkip = async (exp: UpcomingExpense) => {
    try {
      await dispatch(updateUpcoming({ id: exp._id, data: { status: 'skipped' } })).unwrap();
      toast.success('Skipped');
    } catch {
      toast.error('Failed to skip');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this upcoming expense?')) return;
    try {
      await dispatch(deleteUpcoming(id)).unwrap();
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const groupedByStatus = useMemo(() => {
    if (filterStatus !== 'all') return null;
    return {
      pending: displayedItems.filter((u) => u.status === 'pending'),
      paid: displayedItems.filter((u) => u.status === 'paid'),
      skipped: displayedItems.filter((u) => u.status === 'skipped'),
    };
  }, [displayedItems, filterStatus]);

  const ExpenseCard = ({ exp }: { exp: UpcomingExpense }) => {
    const daysLeft = differenceInDays(new Date(exp.dueDate), new Date());
    const isOverdue = daysLeft < 0;
    const isUrgent = daysLeft >= 0 && daysLeft <= 3;

    return (
      <Card
        className={cn(
          'border transition-all',
          isOverdue && exp.status === 'pending' && 'border-red-500/40 bg-red-500/5',
          isUrgent && !isOverdue && exp.status === 'pending' && 'border-amber-500/40 bg-amber-500/5'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: exp.categoryId?.color + '22' }}
            >
              {exp.categoryId?.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{exp.title}</p>
                {exp.recurring !== 'none' && (
                  <span className="text-[10px] text-muted-foreground">
                    {RECURRING_LABELS[exp.recurring]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(exp.dueDate), 'MMM d, yyyy')}
                </span>
                <span className="text-muted-foreground/40 text-xs">•</span>
                <span className="text-xs text-muted-foreground">
                  {exp.walletId?.icon} {exp.walletId?.name}
                </span>
              </div>
              {exp.note && (
                <p className="text-xs text-muted-foreground mt-1 italic">{exp.note}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-bold text-base">৳{exp.amount.toLocaleString()}</span>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] py-0 px-1.5 h-4',
                  isOverdue && exp.status === 'pending' && 'border-red-500 text-red-500',
                  isUrgent && !isOverdue && exp.status === 'pending' && 'border-amber-500 text-amber-500',
                  exp.status === 'paid' && 'border-emerald-500 text-emerald-500',
                  exp.status === 'skipped' && 'border-muted-foreground text-muted-foreground',
                  !isOverdue && !isUrgent && exp.status === 'pending' && 'border-muted-foreground text-muted-foreground'
                )}
              >
                {exp.status === 'paid'
                  ? 'Paid'
                  : exp.status === 'skipped'
                  ? 'Skipped'
                  : isOverdue
                  ? `${Math.abs(daysLeft)}d overdue`
                  : daysLeft === 0
                  ? 'Today'
                  : `${daysLeft}d left`}
              </Badge>
            </div>
          </div>

          {exp.status === 'pending' && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => handlePay(exp)}
                className="flex-1 h-8 rounded-lg text-xs gap-1 bg-emerald-500 hover:bg-emerald-600"
              >
                <CheckCircle2 size={13} /> Pay Now
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSkip(exp)}
                className="flex-1 h-8 rounded-lg text-xs gap-1"
              >
                <XCircle size={13} /> Skip
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(exp._id)}
                className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:text-red-500"
              >
                <Trash2 size={13} />
              </Button>
            </div>
          )}
          {exp.status === 'skipped' && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(exp._id)}
                className="h-7 px-3 rounded-lg text-xs text-muted-foreground hover:text-red-500 ml-auto"
              >
                <Trash2 size={12} className="mr-1" /> Remove
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="px-4 sm:px-6 pt-6 pb-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Upcoming</h1>
          <p className="text-sm text-muted-foreground">
            {pending.length} pending expenses
          </p>
        </div>
        <Link href="/upcoming/new">
          <Button size="icon" className="rounded-xl">
            <Plus size={18} />
          </Button>
        </Link>
      </div>

      {/* Stats Hero Card */}
      {!loading && pending.length > 0 && (
        <div className="rounded-2xl p-5 bg-gradient-to-br from-primary/90 to-primary space-y-4 shadow-lg">
          {/* Big balance */}
          <div>
            <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-widest mb-1">
              Total Pending
            </p>
            <p className="text-4xl font-extrabold text-primary-foreground tracking-tight">
              ৳{totalPending.toLocaleString()}
            </p>
          </div>

          {/* Stacked bar */}
          {categoryBreakdown.length > 0 && (
            <div>
              <div className="flex rounded-full overflow-hidden h-3 gap-px">
                {categoryBreakdown.map((cat, i) => (
                  <div
                    key={i}
                    title={`${cat.name}: ৳${cat.amount.toLocaleString()}`}
                    style={{
                      width: `${(cat.amount / totalPending) * 100}%`,
                      backgroundColor: cat.color,
                      minWidth: cat.amount > 0 ? '4px' : '0',
                    }}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-2 mt-3">
                {categoryBreakdown.map((cat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-1"
                  >
                    <span className="text-xs">{cat.icon}</span>
                    <span className="text-xs text-primary-foreground/90 font-medium">
                      {cat.name}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: cat.color === '#ffffff' ? '#fff' : 'rgba(255,255,255,0.9)' }}
                    >
                      ৳{cat.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter + Sort Bar */}
      <div className="flex flex-col gap-3">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['all', 'pending', 'paid', 'skipped'] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                filterStatus === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              {s === 'all' ? `All (${items.length})` : s === 'pending' ? `Pending (${pending.length})` : s === 'paid' ? `Paid (${paid.length})` : `Skipped (${skipped.length})`}
            </button>
          ))}
        </div>

        {/* Sort buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSort('dueDate')}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              sortKey === 'dueDate'
                ? 'bg-secondary text-foreground border-border'
                : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            <SortIcon k="dueDate" /> Due Date
          </button>
          <button
            onClick={() => handleSort('amount')}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              sortKey === 'amount'
                ? 'bg-secondary text-foreground border-border'
                : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            <SortIcon k="amount" /> Amount
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filterStatus !== 'all' ? (
        // Flat filtered list
        <div className="space-y-3">
          {displayedItems.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-8 text-muted-foreground">
                <p>No {filterStatus} expenses</p>
                {filterStatus === 'pending' && (
                  <Link href="/upcoming/new">
                    <Button variant="link" size="sm">Add one</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            displayedItems.map((exp) => <ExpenseCard key={exp._id} exp={exp} />)
          )}
        </div>
      ) : (
        // Grouped by status
        <div className="space-y-6">
          {/* Pending */}
          <section>
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Pending ({groupedByStatus!.pending.length})
            </h2>
            {groupedByStatus!.pending.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="text-center py-8 text-muted-foreground">
                  <p>No upcoming expenses 🎉</p>
                  <Link href="/upcoming/new">
                    <Button variant="link" size="sm">Add one</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {groupedByStatus!.pending.map((exp) => (
                  <ExpenseCard key={exp._id} exp={exp} />
                ))}
              </div>
            )}
          </section>

          {/* Paid */}
          {groupedByStatus!.paid.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Paid ({groupedByStatus!.paid.length})
              </h2>
              <div className="space-y-3">
                {groupedByStatus!.paid.map((exp) => (
                  <ExpenseCard key={exp._id} exp={exp} />
                ))}
              </div>
            </section>
          )}

          {/* Skipped */}
          {groupedByStatus!.skipped.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Skipped ({groupedByStatus!.skipped.length})
              </h2>
              <div className="space-y-3">
                {groupedByStatus!.skipped.map((exp) => (
                  <ExpenseCard key={exp._id} exp={exp} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
