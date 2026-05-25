'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchUpcoming,
  markUpcomingPaid,
  updateUpcoming,
  deleteUpcoming,
  addContribution,
  removeContribution,
  UpcomingExpense,
} from '@/store/slices/upcomingSlice';
import { setMonthlyFund } from '@/store/slices/settingsSlice';
import { fetchWallets } from '@/store/slices/walletsSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Link from 'next/link';
import {
  Plus, CheckCircle2, XCircle, Trash2,
  ArrowUpDown, ChevronUp, ChevronDown,
  PiggyBank, ChevronRight, X,
  Pencil, TrendingUp, TrendingDown, Wallet,
} from 'lucide-react';
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

// ── Fund vs Expenses Comparison Card ─────────────────────────────────────────
function FundComparisonCard({
  totalExpenses,
  categoryBreakdown,
}: {
  totalExpenses: number;
  categoryBreakdown: { name: string; icon: string; color: string; amount: number }[];
}) {
  const dispatch = useAppDispatch();
  const monthlyFund = useAppSelector((s) => (s as any).settings?.monthlyFund ?? 0);

  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const remaining = monthlyFund - totalExpenses;
  const isOver = remaining < 0;
  const usedPct = monthlyFund > 0 ? Math.min((totalExpenses / monthlyFund) * 100, 100) : 0;

  const donutData =
    monthlyFund > 0
      ? [
          { name: 'Expenses', value: Math.min(totalExpenses, monthlyFund) },
          { name: isOver ? 'Over budget' : 'Remaining', value: isOver ? 0 : remaining },
        ]
      : [{ name: 'No fund set', value: 1 }];

  const donutColors =
    monthlyFund > 0
      ? [isOver ? '#FF3B30' : usedPct > 75 ? '#FF9500' : '#007AFF', isOver ? '#FF3B3020' : '#34C75940']
      : ['#E5E5EA'];

  const handleSave = () => {
    const val = parseFloat(inputVal);
    if (!inputVal || isNaN(val) || val < 0) { toast.error('Enter a valid amount'); return; }
    dispatch(setMonthlyFund(val));
    setEditing(false);
    setInputVal('');
    toast.success('Monthly fund updated');
  };

  return (
    <Card className="border border-border overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet size={14} className="text-primary" />
            </div>
            <span className="font-semibold text-sm">Fund vs Expenses</span>
          </div>
          <button
            onClick={() => { setEditing((v) => !v); setInputVal(monthlyFund > 0 ? String(monthlyFund) : ''); }}
            className="flex items-center gap-1 text-xs text-primary font-medium"
          >
            <Pencil size={11} />
            {monthlyFund > 0 ? 'Edit Fund' : 'Set Fund'}
          </button>
        </div>

        {/* Edit input */}
        {editing && (
          <div className="px-4 pb-3 flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">৳</span>
              <Input
                type="number"
                placeholder="Your monthly salary / income"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="pl-7 h-9 rounded-lg text-sm"
                min="0"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <Button size="sm" onClick={handleSave} className="h-9 rounded-lg px-4 text-xs">Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-9 w-9 rounded-lg p-0">
              <X size={14} />
            </Button>
          </div>
        )}

        {monthlyFund <= 0 && !editing ? (
          <div className="px-4 pb-5 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Set your monthly salary or income to compare against your planned expenses.
            </p>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="rounded-lg text-xs gap-1">
              <Plus size={13} /> Set Monthly Fund
            </Button>
          </div>
        ) : monthlyFund > 0 ? (
          <>
            {/* Donut + stats */}
            <div className="flex items-center gap-4 px-4 pb-2">
              <div className="relative w-28 h-28 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={32} outerRadius={52} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                      {donutData.map((_, i) => <Cell key={i} fill={donutColors[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`৳${v.toLocaleString()}`, '']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className={cn('text-sm font-extrabold', isOver ? 'text-red-500' : 'text-foreground')}>
                    {Math.round(usedPct)}%
                  </span>
                  <span className="text-[9px] text-muted-foreground">used</span>
                </div>
              </div>

              <div className="flex-1 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp size={12} className="text-primary" /> Monthly Fund
                  </div>
                  <span className="text-sm font-bold">৳{monthlyFund.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingDown size={12} className={isOver ? 'text-red-500' : 'text-amber-500'} /> Planned Spend
                  </div>
                  <span className={cn('text-sm font-bold', isOver ? 'text-red-500' : 'text-foreground')}>
                    ৳{totalExpenses.toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">{isOver ? 'Over budget' : 'Remaining'}</span>
                  <span className={cn('text-sm font-extrabold', isOver ? 'text-red-500' : 'text-emerald-500')}>
                    {isOver ? '-' : '+'}৳{Math.abs(remaining).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-4 pb-2 space-y-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', isOver ? 'bg-red-500' : usedPct > 75 ? 'bg-amber-400' : 'bg-primary')}
                  style={{ width: `${usedPct}%` }}
                />
              </div>
              {isOver && (
                <p className="text-[11px] text-red-500 font-medium">
                  ⚠️ Expenses exceed your fund by ৳{Math.abs(remaining).toLocaleString()}
                </p>
              )}
            </div>

            {/* Category breakdown */}
            {categoryBreakdown.length > 0 && (
              <div className="px-4 pb-4 space-y-2">
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Breakdown</p>
                {categoryBreakdown.map((cat, i) => {
                  const pct = monthlyFund > 0 ? (cat.amount / monthlyFund) * 100 : 0;
                  return (
                    <div key={i} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span>{cat.icon}</span>
                          <span className="text-muted-foreground">{cat.name}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{Math.round(pct)}%</span>
                          <span className="font-semibold w-24 text-right">৳{cat.amount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: cat.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
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
  const totalSaved = pending.reduce(
    (s, u) => s + (u.contributions || []).reduce((a, c) => a + c.amount, 0),
    0
  );

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { name: string; icon: string; color: string; amount: number }> = {};
    for (const exp of pending) {
      const id = exp.categoryId?._id || 'unknown';
      if (!map[id]) {
        map[id] = { name: exp.categoryId?.name || 'Unknown', icon: exp.categoryId?.icon || '📦', color: exp.categoryId?.color || '#6366f1', amount: 0 };
      }
      map[id].amount += exp.amount;
    }
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [pending]);

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
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  // handlePay is now inside ExpenseCard so it can access per-card wallet state

  const handleSkip = async (exp: UpcomingExpense) => {
    try {
      await dispatch(updateUpcoming({ id: exp._id, data: { status: 'skipped' } })).unwrap();
      toast.success('Skipped');
    } catch { toast.error('Failed to skip'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this upcoming expense?')) return;
    try {
      await dispatch(deleteUpcoming(id)).unwrap();
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const groupedByStatus = useMemo(() => {
    if (filterStatus !== 'all') return null;
    return {
      pending: displayedItems.filter((u) => u.status === 'pending'),
      paid: displayedItems.filter((u) => u.status === 'paid'),
      skipped: displayedItems.filter((u) => u.status === 'skipped'),
    };
  }, [displayedItems, filterStatus]);

  // ── Expense Card ──────────────────────────────────────────────────────────
  const ExpenseCard = ({ exp }: { exp: UpcomingExpense }) => {
    const daysLeft = differenceInDays(new Date(exp.dueDate), new Date());
    const isOverdue = daysLeft < 0;
    const isUrgent = daysLeft >= 0 && daysLeft <= 3;
    const contributions = exp.contributions || [];
    const savedAmount = contributions.reduce((s, c) => s + c.amount, 0);
    const progressPct = exp.amount > 0 ? Math.min((savedAmount / exp.amount) * 100, 100) : 0;
    const isFullySaved = savedAmount >= exp.amount;

    const wallets = useAppSelector((s) => s.wallets.items);

    // Pay panel state
    const [showPay, setShowPay] = useState(false);
    const [payWalletId, setPayWalletId] = useState('');
    const [payLoading, setPayLoading] = useState(false);

    // Save funds panel state
    const [showFunds, setShowFunds] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [fundAmount, setFundAmount] = useState('');
    const [fundNote, setFundNote] = useState('');
    const [fundLoading, setFundLoading] = useState(false);

    const handlePay = async () => {
      if (!payWalletId) { toast.error('Select a wallet'); return; }
      setPayLoading(true);
      try {
        await dispatch(markUpcomingPaid({ id: exp._id, walletId: payWalletId })).unwrap();
        dispatch(fetchWallets());
        toast.success(`✅ Marked "${exp.title}" as paid!`);
        setShowPay(false);
      } catch (e: any) {
        toast.error(e?.message || 'Failed to mark as paid');
      } finally {
        setPayLoading(false);
      }
    };

    const handleAddFund = async (e: React.FormEvent) => {
      e.preventDefault();
      const amt = parseFloat(fundAmount);
      if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
      setFundLoading(true);
      try {
        await dispatch(addContribution({ id: exp._id, amount: amt, note: fundNote.trim() || undefined })).unwrap();
        toast.success(`💰 Added ৳${amt.toLocaleString()} to "${exp.title}"`);
        setFundAmount(''); setFundNote(''); setShowFunds(false);
      } catch { toast.error('Failed to add funds'); }
      finally { setFundLoading(false); }
    };

    const handleRemoveContribution = async (contributionId: string) => {
      try {
        await dispatch(removeContribution({ id: exp._id, contributionId })).unwrap();
        toast.success('Removed');
      } catch { toast.error('Failed to remove'); }
    };

    return (
      <Card className={cn('border transition-all', isOverdue && exp.status === 'pending' && 'border-red-500/40 bg-red-500/5', isUrgent && !isOverdue && exp.status === 'pending' && 'border-amber-500/40 bg-amber-500/5')}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: exp.categoryId?.color + '22' }}>
              {exp.categoryId?.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{exp.title}</p>
                {exp.recurring !== 'none' && <span className="text-[10px] text-muted-foreground">{RECURRING_LABELS[exp.recurring]}</span>}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-muted-foreground">{format(new Date(exp.dueDate), 'MMM d, yyyy')}</span>
                <span className="text-muted-foreground/40 text-xs">•</span>
                <span className="text-xs text-muted-foreground">{exp.walletId?.icon} {exp.walletId?.name}</span>
              </div>
              {exp.note && <p className="text-xs text-muted-foreground mt-1 italic">{exp.note}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-bold text-base">৳{exp.amount.toLocaleString()}</span>
              <Badge variant="outline" className={cn('text-[10px] py-0 px-1.5 h-4', isOverdue && exp.status === 'pending' && 'border-red-500 text-red-500', isUrgent && !isOverdue && exp.status === 'pending' && 'border-amber-500 text-amber-500', exp.status === 'paid' && 'border-emerald-500 text-emerald-500', exp.status === 'skipped' && 'border-muted-foreground text-muted-foreground', !isOverdue && !isUrgent && exp.status === 'pending' && 'border-muted-foreground text-muted-foreground')}>
                {exp.status === 'paid' ? 'Paid' : exp.status === 'skipped' ? 'Skipped' : isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
              </Badge>
            </div>
          </div>

          {exp.status === 'pending' && contributions.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <PiggyBank size={11} />
                  Saved <span className={cn('font-semibold', isFullySaved ? 'text-emerald-500' : 'text-foreground')}>৳{savedAmount.toLocaleString()}</span> of ৳{exp.amount.toLocaleString()}
                </span>
                <span className={cn('font-semibold', isFullySaved ? 'text-emerald-500' : progressPct >= 50 ? 'text-primary' : 'text-muted-foreground')}>{Math.round(progressPct)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-500', isFullySaved ? 'bg-emerald-500' : progressPct >= 50 ? 'bg-primary' : 'bg-amber-400')} style={{ width: `${progressPct}%` }} />
              </div>
              {isFullySaved && <p className="text-[11px] text-emerald-500 font-medium">✅ Fully funded — ready to pay!</p>}
            </div>
          )}

          {exp.status === 'pending' && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => { setShowPay((v) => !v); setShowFunds(false); if (!payWalletId) setPayWalletId(exp.walletId?._id || ''); }}
                className={cn('flex-1 h-8 rounded-lg text-xs gap-1', showPay ? 'bg-emerald-600' : 'bg-emerald-500 hover:bg-emerald-600')}
              >
                <CheckCircle2 size={13} /> {showPay ? 'Cancel' : 'Pay Now'}
              </Button>
              <Button size="sm" variant={showFunds ? 'secondary' : 'outline'} onClick={() => { setShowFunds((v) => !v); setShowPay(false); }} className="flex-1 h-8 rounded-lg text-xs gap-1">
                <PiggyBank size={13} />{showFunds ? 'Cancel' : 'Save Funds'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleSkip(exp)} className="h-8 px-2 rounded-lg text-xs"><XCircle size={13} /></Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(exp._id)} className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:text-red-500"><Trash2 size={13} /></Button>
            </div>
          )}

          {/* Wallet picker for Pay Now */}
          {exp.status === 'pending' && showPay && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} /> Pay ৳{exp.amount.toLocaleString()} from which wallet?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {wallets.map((w) => (
                  <button
                    key={w._id}
                    type="button"
                    onClick={() => setPayWalletId(w._id)}
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-xs font-medium',
                      payWalletId === w._id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-border hover:border-emerald-500/50'
                    )}
                  >
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: w.color + '22' }}>
                      {w.icon}
                    </span>
                    <div className="min-w-0 text-left">
                      <p className="truncate font-semibold text-xs">{w.name}</p>
                      <p className="text-muted-foreground text-[10px]">৳{w.balance.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Button
                size="sm"
                disabled={!payWalletId || payLoading}
                onClick={handlePay}
                className="w-full h-8 rounded-lg text-xs bg-emerald-500 hover:bg-emerald-600 gap-1"
              >
                <CheckCircle2 size={13} />
                {payLoading ? 'Processing…' : `Confirm Payment`}
              </Button>
            </div>
          )}

          {exp.status === 'pending' && showFunds && (
            <form onSubmit={handleAddFund} className="mt-3 p-3 rounded-xl bg-muted/60 border border-border space-y-2">
              <p className="text-xs font-semibold flex items-center gap-1"><PiggyBank size={12} className="text-primary" /> Add savings toward this expense</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">৳</span>
                  <Input type="number" placeholder="Amount" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} className="pl-7 h-9 rounded-lg text-sm" min="1" step="1" autoFocus />
                </div>
                <Input placeholder="Note (optional)" value={fundNote} onChange={(e) => setFundNote(e.target.value)} className="flex-1 h-9 rounded-lg text-sm" />
              </div>
              <Button type="submit" size="sm" disabled={fundLoading} className="w-full h-8 rounded-lg text-xs gap-1">{fundLoading ? 'Saving…' : '💰 Save Funds'}</Button>
            </form>
          )}

          {contributions.length > 0 && (
            <div className="mt-3">
              <button type="button" onClick={() => setShowHistory((v) => !v)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ChevronRight size={12} className={cn('transition-transform', showHistory && 'rotate-90')} />
                {contributions.length} contribution{contributions.length !== 1 ? 's' : ''}
              </button>
              {showHistory && (
                <div className="mt-2 space-y-1">
                  {contributions.map((c) => (
                    <div key={c._id} className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2">
                      <span className="text-emerald-500 font-semibold">+৳{c.amount.toLocaleString()}</span>
                      <span className="text-muted-foreground flex-1 truncate">{c.note || format(new Date(c.date), 'MMM d, yyyy')}</span>
                      <span className="text-muted-foreground shrink-0">{format(new Date(c.date), 'MMM d')}</span>
                      {exp.status === 'pending' && (
                        <button type="button" onClick={() => handleRemoveContribution(c._id)} className="text-muted-foreground hover:text-red-500 transition-colors ml-1"><X size={11} /></button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {exp.status === 'skipped' && (
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="ghost" onClick={() => handleDelete(exp._id)} className="h-7 px-3 rounded-lg text-xs text-muted-foreground hover:text-red-500 ml-auto">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Upcoming</h1>
          <p className="text-sm text-muted-foreground">{pending.length} pending expenses</p>
        </div>
        <Link href="/upcoming/new"><Button size="icon" className="rounded-xl"><Plus size={18} /></Button></Link>
      </div>

      {/* Fund vs Expenses comparison */}
      {!loading && (
        <FundComparisonCard totalExpenses={totalPending} categoryBreakdown={categoryBreakdown} />
      )}

      {/* Stats Hero Card */}
      {!loading && pending.length > 0 && (
        <div className="rounded-2xl p-5 bg-gradient-to-br from-primary/90 to-primary space-y-4 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-widest mb-1">Total Pending</p>
              <p className="text-4xl font-extrabold text-primary-foreground tracking-tight">৳{totalPending.toLocaleString()}</p>
            </div>
            {totalSaved > 0 && (
              <div className="text-right">
                <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-widest mb-1">Total Saved</p>
                <p className="text-2xl font-bold text-primary-foreground/90">৳{totalSaved.toLocaleString()}</p>
                <p className="text-[11px] text-primary-foreground/60 mt-0.5">{Math.round((totalSaved / totalPending) * 100)}% funded</p>
              </div>
            )}
          </div>
          {totalSaved > 0 && (
            <div className="h-2 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-white/80 transition-all duration-500" style={{ width: `${Math.min((totalSaved / totalPending) * 100, 100)}%` }} />
            </div>
          )}
          {categoryBreakdown.length > 0 && (
            <div>
              <div className="flex rounded-full overflow-hidden h-3 gap-px">
                {categoryBreakdown.map((cat, i) => (
                  <div key={i} title={`${cat.name}: ৳${cat.amount.toLocaleString()}`} style={{ width: `${(cat.amount / totalPending) * 100}%`, backgroundColor: cat.color, minWidth: cat.amount > 0 ? '4px' : '0' }} />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {categoryBreakdown.map((cat, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <span className="text-xs">{cat.icon}</span>
                    <span className="text-xs text-primary-foreground/90 font-medium">{cat.name}</span>
                    <span className="text-xs font-bold text-white/90">৳{cat.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter + Sort Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['all', 'pending', 'paid', 'skipped'] as FilterStatus[]).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border', filterStatus === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50')}>
              {s === 'all' ? `All (${items.length})` : s === 'pending' ? `Pending (${pending.length})` : s === 'paid' ? `Paid (${paid.length})` : `Skipped (${skipped.length})`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSort('dueDate')} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all', sortKey === 'dueDate' ? 'bg-secondary text-foreground border-border' : 'border-border text-muted-foreground hover:border-primary/50')}>
            <SortIcon k="dueDate" /> Due Date
          </button>
          <button onClick={() => handleSort('amount')} className={cn('flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all', sortKey === 'amount' ? 'bg-secondary text-foreground border-border' : 'border-border text-muted-foreground hover:border-primary/50')}>
            <SortIcon k="amount" /> Amount
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}</div>
      ) : filterStatus !== 'all' ? (
        <div className="space-y-3">
          {displayedItems.length === 0 ? (
            <Card className="border-dashed"><CardContent className="text-center py-8 text-muted-foreground"><p>No {filterStatus} expenses</p>{filterStatus === 'pending' && <Link href="/upcoming/new"><Button variant="link" size="sm">Add one</Button></Link>}</CardContent></Card>
          ) : displayedItems.map((exp) => <ExpenseCard key={exp._id} exp={exp} />)}
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Pending ({groupedByStatus!.pending.length})</h2>
            {groupedByStatus!.pending.length === 0 ? (
              <Card className="border-dashed"><CardContent className="text-center py-8 text-muted-foreground"><p>No upcoming expenses 🎉</p><Link href="/upcoming/new"><Button variant="link" size="sm">Add one</Button></Link></CardContent></Card>
            ) : (
              <div className="space-y-3">{groupedByStatus!.pending.map((exp) => <ExpenseCard key={exp._id} exp={exp} />)}</div>
            )}
          </section>
          {groupedByStatus!.paid.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Paid ({groupedByStatus!.paid.length})</h2>
              <div className="space-y-3">{groupedByStatus!.paid.map((exp) => <ExpenseCard key={exp._id} exp={exp} />)}</div>
            </section>
          )}
          {groupedByStatus!.skipped.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Skipped ({groupedByStatus!.skipped.length})</h2>
              <div className="space-y-3">{groupedByStatus!.skipped.map((exp) => <ExpenseCard key={exp._id} exp={exp} />)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
