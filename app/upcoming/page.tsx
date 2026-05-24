'use client';

import { useEffect } from 'react';
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
import { Plus, CheckCircle2, XCircle, Trash2, RefreshCcw } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const RECURRING_LABELS: Record<string, string> = {
  none: '',
  weekly: '🔁 Weekly',
  monthly: '🔁 Monthly',
  yearly: '🔁 Yearly',
};

export default function UpcomingPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.upcoming);

  useEffect(() => {
    dispatch(fetchUpcoming());
  }, [dispatch]);

  const pending = items.filter((u) => u.status === 'pending');
  const paid = items.filter((u) => u.status === 'paid');
  const skipped = items.filter((u) => u.status === 'skipped');

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

  const totalPending = pending.reduce((s, u) => s + u.amount, 0);

  return (
    <div className="px-4 sm:px-6 pt-6 pb-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Upcoming</h1>
          <p className="text-sm text-muted-foreground">
            ৳{totalPending.toLocaleString()} pending
          </p>
        </div>
        <Link href="/upcoming/new">
          <Button size="icon" className="rounded-xl">
            <Plus size={18} />
          </Button>
        </Link>
      </div>

      {/* Pending */}
      <section>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Pending ({pending.length})
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : pending.length === 0 ? (
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
            {pending.map((exp) => {
              const daysLeft = differenceInDays(new Date(exp.dueDate), new Date());
              const isOverdue = daysLeft < 0;
              const isUrgent = daysLeft >= 0 && daysLeft <= 3;

              return (
                <Card
                  key={exp._id}
                  className={cn(
                    'border transition-all',
                    isOverdue && 'border-red-500/40 bg-red-500/5',
                    isUrgent && !isOverdue && 'border-amber-500/40 bg-amber-500/5'
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
                            isOverdue && 'border-red-500 text-red-500',
                            isUrgent && !isOverdue && 'border-amber-500 text-amber-500',
                            !isOverdue && !isUrgent && 'border-muted-foreground text-muted-foreground'
                          )}
                        >
                          {isOverdue
                            ? `${Math.abs(daysLeft)}d overdue`
                            : daysLeft === 0
                            ? 'Today'
                            : `${daysLeft}d left`}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Paid */}
      {paid.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Paid ({paid.length})
          </h2>
          <div className="space-y-2">
            {paid.map((exp) => (
              <div
                key={exp._id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 opacity-70"
              >
                <span className="text-xl">{exp.categoryId?.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-through truncate">{exp.title}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(exp.dueDate), 'MMM d')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">৳{exp.amount.toLocaleString()}</span>
                  <CheckCircle2 size={15} className="text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skipped */}
      {skipped.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Skipped ({skipped.length})
          </h2>
          <div className="space-y-2">
            {skipped.map((exp) => (
              <div
                key={exp._id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 opacity-60"
              >
                <span className="text-xl opacity-50">{exp.categoryId?.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground line-through truncate">{exp.title}</p>
                </div>
                <span className="text-sm text-muted-foreground">৳{exp.amount.toLocaleString()}</span>
                <button
                  onClick={() => handleDelete(exp._id)}
                  className="text-muted-foreground hover:text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
