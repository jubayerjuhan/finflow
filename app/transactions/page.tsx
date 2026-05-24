'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTransactions,
  deleteTransaction,
  setFilters,
} from '@/store/slices/transactionsSlice';
import TransactionItem from '@/components/shared/TransactionItem';
import { TransactionSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Plus, Filter, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Transaction } from '@/store/slices/transactionsSlice';

export default function TransactionsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, total, page, totalPages, filters } = useAppSelector(
    (s) => s.transactions
  );
  const wallets = useAppSelector((s) => s.wallets.items);
  const categories = useAppSelector((s) => s.categories.items);

  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    walletId: '',
    categoryId: '',
    type: '',
    startDate: '',
    endDate: '',
  });

  const loadTransactions = useCallback(() => {
    const f: any = { page, limit: 20 };
    if (localFilters.walletId) f.walletId = localFilters.walletId;
    if (localFilters.categoryId) f.categoryId = localFilters.categoryId;
    if (localFilters.type) f.type = localFilters.type;
    if (localFilters.startDate) f.startDate = localFilters.startDate;
    if (localFilters.endDate) f.endDate = localFilters.endDate;
    dispatch(fetchTransactions(f));
  }, [dispatch, page, localFilters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleDelete = async (tx: Transaction) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      await dispatch(deleteTransaction(tx._id)).unwrap();
      toast.success('Deleted');
      loadTransactions();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const applyFilters = () => {
    dispatch(setFilters({ page: 1 }));
    loadTransactions();
  };

  const clearFilters = () => {
    setLocalFilters({ walletId: '', categoryId: '', type: '', startDate: '', endDate: '' });
    dispatch(setFilters({ page: 1 }));
    dispatch(fetchTransactions({ page: 1, limit: 20 }));
  };

  const hasActiveFilters = Object.values(localFilters).some(Boolean);

  // Group by date
  const grouped: Record<string, Transaction[]> = {};
  items.forEach((tx) => {
    const key = format(new Date(tx.date), 'yyyy-MM-dd');
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(tx);
  });

  return (
    <div className="px-4 sm:px-6 pt-6 pb-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-xl relative ${hasActiveFilters ? 'border-primary' : ''}`}
          >
            <Filter size={16} />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>
          <Link href="/transactions/new">
            <Button size="icon" className="rounded-xl">
              <Plus size={18} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-4 border border-border">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Wallet</label>
                <Select
                  value={localFilters.walletId || 'all'}
                  onValueChange={(v) =>
                    setLocalFilters((f) => ({ ...f, walletId: v === 'all' ? '' : v }))
                  }
                >
                  <SelectTrigger className="rounded-lg h-9">
                    <SelectValue placeholder="All wallets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Wallets</SelectItem>
                    {wallets.map((w) => (
                      <SelectItem key={w._id} value={w._id}>
                        {w.icon} {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <Select
                  value={localFilters.type || 'all'}
                  onValueChange={(v) =>
                    setLocalFilters((f) => ({ ...f, type: v === 'all' ? '' : v }))
                  }
                >
                  <SelectTrigger className="rounded-lg h-9">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From</label>
                <Input
                  type="date"
                  value={localFilters.startDate}
                  onChange={(e) =>
                    setLocalFilters((f) => ({ ...f, startDate: e.target.value }))
                  }
                  className="rounded-lg h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To</label>
                <Input
                  type="date"
                  value={localFilters.endDate}
                  onChange={(e) =>
                    setLocalFilters((f) => ({ ...f, endDate: e.target.value }))
                  }
                  className="rounded-lg h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={applyFilters} size="sm" className="flex-1 rounded-lg">
                Apply
              </Button>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <X size={14} />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction List */}
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
          <Link href="/transactions/new">
            <Button variant="link" className="mt-2">Add one now</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, txs]) => (
              <div key={date}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-muted-foreground px-1">
                    {format(new Date(date), 'EEEE, MMM d')}
                  </p>
                  <p className="text-xs text-muted-foreground px-1">
                    {txs.filter((t) => t.type === 'expense').length > 0 && (
                      <span className="text-red-500">
                        -৳{txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0).toLocaleString()}
                      </span>
                    )}
                    {txs.filter((t) => t.type === 'income').length > 0 && (
                      <span className="text-emerald-500 ml-2">
                        +৳{txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0).toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>
                <Card className="border border-border">
                  <CardContent className="p-0 divide-y divide-border">
                    {txs.map((tx) => (
                      <div key={tx._id} className="relative group">
                        <TransactionItem transaction={tx} />
                        {/* Always visible on mobile; hidden until hover on desktop */}
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
            ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => {
                  dispatch(setFilters({ page: page - 1 }));
                }}
                className="rounded-lg"
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => {
                  dispatch(setFilters({ page: page + 1 }));
                }}
                className="rounded-lg"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
