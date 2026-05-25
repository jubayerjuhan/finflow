'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTransactions,
  deleteTransaction,
  setFilters,
  Transaction,
} from '@/store/slices/transactionsSlice';
import TransactionItem from '@/components/shared/TransactionItem';
import { TransactionSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import Link from 'next/link';
import {
  Plus, Filter, X, Trash2,
  ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, ArrowLeftRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type QuickFilter = 'all' | 'income' | 'expense' | 'transfer';

export default function TransactionsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, total, page, totalPages } = useAppSelector((s) => s.transactions);
  const wallets = useAppSelector((s) => s.wallets.items);
  const categories = useAppSelector((s) => s.categories.items);

  const [showFilters, setShowFilters] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [localFilters, setLocalFilters] = useState({
    walletId: '', categoryId: '', type: '', startDate: '', endDate: '',
  });

  const loadTransactions = useCallback((overridePage?: number) => {
    const f: any = { page: overridePage ?? page, limit: 20 };
    if (localFilters.walletId) f.walletId = localFilters.walletId;
    if (localFilters.categoryId) f.categoryId = localFilters.categoryId;
    if (quickFilter !== 'all') f.type = quickFilter;
    else if (localFilters.type) f.type = localFilters.type;
    if (localFilters.startDate) f.startDate = localFilters.startDate;
    if (localFilters.endDate) f.endDate = localFilters.endDate;
    dispatch(fetchTransactions(f));
  }, [dispatch, page, localFilters, quickFilter]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const handleDelete = async (tx: Transaction) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await dispatch(deleteTransaction(tx._id)).unwrap();
      toast.success('Deleted');
      loadTransactions();
    } catch { toast.error('Failed to delete'); }
  };

  const applyFilters = () => { dispatch(setFilters({ page: 1 })); loadTransactions(1); };
  const clearFilters = () => {
    setLocalFilters({ walletId: '', categoryId: '', type: '', startDate: '', endDate: '' });
    dispatch(setFilters({ page: 1 }));
    dispatch(fetchTransactions({ page: 1, limit: 20 }));
  };
  const hasActiveFilters = Object.values(localFilters).some(Boolean);

  // ── Computed stats from current items ────────────────────────────────────
  const totalIncome  = useMemo(() => items.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0), [items]);
  const totalExpense = useMemo(() => items.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [items]);
  const netFlow      = totalIncome - totalExpense;

  // Category breakdown (expenses only)
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { name: string; icon: string; color: string; amount: number }> = {};
    items.filter((t) => t.type === 'expense').forEach((t) => {
      const id = t.categoryId?._id || 'other';
      if (!map[id]) map[id] = { name: t.categoryId?.name || 'Other', icon: t.categoryId?.icon || '📦', color: t.categoryId?.color || '#6366f1', amount: 0 };
      map[id].amount += t.amount;
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount).slice(0, 6);
  }, [items]);

  // Bar chart: income vs expense per day (from current page)
  const dailyData = useMemo(() => {
    const map: Record<string, { day: string; income: number; expense: number }> = {};
    items.forEach((t) => {
      const key = format(new Date(t.date), 'MMM d');
      if (!map[key]) map[key] = { day: key, income: 0, expense: 0 };
      if (t.type === 'income') map[key].income += t.amount;
      if (t.type === 'expense') map[key].expense += t.amount;
    });
    return Object.values(map).slice(-7);
  }, [items]);

  // Group list by date
  const grouped = useMemo(() => {
    const g: Record<string, Transaction[]> = {};
    items.forEach((tx) => {
      const key = format(new Date(tx.date), 'yyyy-MM-dd');
      if (!g[key]) g[key] = [];
      g[key].push(tx);
    });
    return g;
  }, [items]);

  const quickFilterOptions: { key: QuickFilter; label: string; color: string }[] = [
    { key: 'all',      label: 'All',      color: '' },
    { key: 'income',   label: 'Income',   color: 'emerald' },
    { key: 'expense',  label: 'Expense',  color: 'red' },
    { key: 'transfer', label: 'Transfer', color: 'blue' },
  ];

  const donutColors = categoryBreakdown.map((c) => c.color);

  // Custom donut tooltip
  const DonutTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-apple">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-muted-foreground">৳{payload[0].value.toLocaleString()}</p>
      </div>
    );
  };

  return (
    <div className="px-4 sm:px-6 pt-6 pb-6 max-w-3xl mx-auto space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className={cn('rounded-xl relative', hasActiveFilters && 'border-primary')}>
            <Filter size={16} />
            {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />}
          </Button>
          <Link href="/transactions/new">
            <Button size="icon" className="rounded-xl"><Plus size={18} /></Button>
          </Link>
        </div>
      </div>

      {/* ── Hero stats card ── */}
      {!loading && items.length > 0 && (
        <div className="rounded-2xl p-5 bg-gradient-to-br from-primary/90 to-primary shadow-lg space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-primary-foreground/60 text-[10px] font-medium uppercase tracking-widest mb-1 flex items-center gap-1">
                <TrendingUp size={10} /> Income
              </p>
              <p className="text-lg font-extrabold text-primary-foreground">৳{totalIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-primary-foreground/60 text-[10px] font-medium uppercase tracking-widest mb-1 flex items-center gap-1">
                <TrendingDown size={10} /> Expenses
              </p>
              <p className="text-lg font-extrabold text-primary-foreground">৳{totalExpense.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-primary-foreground/60 text-[10px] font-medium uppercase tracking-widest mb-1 flex items-center gap-1">
                <ArrowLeftRight size={10} /> Net
              </p>
              <p className={cn('text-lg font-extrabold', netFlow >= 0 ? 'text-white' : 'text-red-300')}>
                {netFlow >= 0 ? '+' : ''}৳{netFlow.toLocaleString()}
              </p>
            </div>
          </div>
          {/* Income vs expense bar */}
          {totalIncome + totalExpense > 0 && (
            <div className="space-y-1">
              <div className="flex h-2 rounded-full overflow-hidden gap-px">
                {totalIncome > 0 && (
                  <div className="bg-emerald-400 rounded-l-full transition-all" style={{ width: `${(totalIncome / (totalIncome + totalExpense)) * 100}%` }} />
                )}
                {totalExpense > 0 && (
                  <div className="bg-red-400 rounded-r-full transition-all" style={{ width: `${(totalExpense / (totalIncome + totalExpense)) * 100}%` }} />
                )}
              </div>
              <div className="flex justify-between text-[10px] text-primary-foreground/60">
                <span>🟢 Income</span>
                <span>🔴 Expenses</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Charts row (only when there's expense data) ── */}
      {!loading && categoryBreakdown.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Donut — expense by category */}
          <Card className="border border-border">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Expense Breakdown</p>
              <div className="flex items-center gap-3">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={28} outerRadius={44} dataKey="amount" strokeWidth={0}>
                        {categoryBreakdown.map((_, i) => <Cell key={i} fill={donutColors[i]} />)}
                      </Pie>
                      <Tooltip content={<DonutTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5 min-w-0">
                  {categoryBreakdown.map((cat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      <span className="text-sm">{cat.icon}</span>
                      <span className="text-muted-foreground truncate flex-1">{cat.name}</span>
                      <span className="font-semibold shrink-0">৳{cat.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily income vs expense bar chart */}
          {dailyData.length > 1 && (
            <Card className="border border-border">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Daily Flow</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={dailyData} barSize={8} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      formatter={(v: number, name: string) => [`৳${v.toLocaleString()}`, name]}
                      contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="income"  fill="#34C759" radius={[4, 4, 0, 0]} name="Income" />
                    <Bar dataKey="expense" fill="#FF3B30" radius={[4, 4, 0, 0]} name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2.5 h-2.5 rounded-sm bg-[#34C759]" /> Income</div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2.5 h-2.5 rounded-sm bg-[#FF3B30]" /> Expense</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Quick type filter chips ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {quickFilterOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setQuickFilter(key); dispatch(setFilters({ page: 1 })); }}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              quickFilter === key
                ? key === 'income'   ? 'bg-emerald-500 text-white border-emerald-500'
                : key === 'expense'  ? 'bg-red-500 text-white border-red-500'
                : key === 'transfer' ? 'bg-primary text-primary-foreground border-primary'
                :                      'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            {key === 'income' ? '↑' : key === 'expense' ? '↓' : key === 'transfer' ? '⇄' : ''}{key !== 'all' ? ' ' : ''}{label}
          </button>
        ))}
      </div>

      {/* ── Advanced filters panel ── */}
      {showFilters && (
        <Card className="border border-border">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Wallet</label>
                <Select value={localFilters.walletId || 'all'} onValueChange={(v) => setLocalFilters((f) => ({ ...f, walletId: v === 'all' ? '' : v }))}>
                  <SelectTrigger className="rounded-lg h-9"><SelectValue placeholder="All wallets" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Wallets</SelectItem>
                    {wallets.map((w) => <SelectItem key={w._id} value={w._id}>{w.icon} {w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                <Select value={localFilters.categoryId || 'all'} onValueChange={(v) => setLocalFilters((f) => ({ ...f, categoryId: v === 'all' ? '' : v }))}>
                  <SelectTrigger className="rounded-lg h-9"><SelectValue placeholder="All categories" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => <SelectItem key={c._id} value={c._id}>{c.icon} {c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From</label>
                <Input type="date" value={localFilters.startDate} onChange={(e) => setLocalFilters((f) => ({ ...f, startDate: e.target.value }))} className="rounded-lg h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To</label>
                <Input type="date" value={localFilters.endDate} onChange={(e) => setLocalFilters((f) => ({ ...f, endDate: e.target.value }))} className="rounded-lg h-9 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={applyFilters} size="sm" className="flex-1 rounded-lg">Apply</Button>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline" size="sm" className="rounded-lg"><X size={14} /></Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Transaction list ── */}
      {loading ? (
        <Card className="border border-border">
          <CardContent className="p-0 divide-y divide-border">
            {[1, 2, 3, 4, 5, 6].map((i) => <TransactionSkeleton key={i} />)}
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">💸</p>
          <p className="font-medium">No transactions found</p>
          <Link href="/transactions/new"><Button variant="link" className="mt-2">Add one now</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, txs]) => {
              const dayIncome  = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
              const dayExpense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
              return (
                <div key={date}>
                  {/* Date header */}
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {format(new Date(date), 'EEEE, MMM d')}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      {dayExpense > 0 && <span className="text-red-500 font-medium">−৳{dayExpense.toLocaleString()}</span>}
                      {dayIncome  > 0 && <span className="text-emerald-500 font-medium">+৳{dayIncome.toLocaleString()}</span>}
                    </div>
                  </div>
                  <Card className="border border-border">
                    <CardContent className="p-0 divide-y divide-border">
                      {txs.map((tx) => (
                        <div key={tx._id} className="relative group">
                          <TransactionItem transaction={tx} />
                          {/* Fee badge */}
                          {tx.fee && tx.fee > 0 && (
                            <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full hidden group-hover:block">
                              +৳{tx.fee} fee
                            </span>
                          )}
                          <button
                            onClick={() => handleDelete(tx)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              );
            })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => { dispatch(setFilters({ page: page - 1 })); }} className="rounded-lg">
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => { dispatch(setFilters({ page: page + 1 })); }} className="rounded-lg">
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
