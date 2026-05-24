'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createUpcoming } from '@/store/slices/upcomingSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { fetchWallets } from '@/store/slices/walletsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

export default function UpcomingForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const wallets = useAppSelector((s) => s.wallets.items);
  const categories = useAppSelector((s) => s.categories.items);
  const categoriesLoading = useAppSelector((s) => s.categories.loading);
  const walletsLoading = useAppSelector((s) => s.wallets.loading);

  // Ensure categories and wallets are loaded — AppShell fetches them but
  // the async fetch may not have resolved by the time this page mounts.
  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
    if (wallets.length === 0) dispatch(fetchWallets());
  }, [dispatch, categories.length, wallets.length]);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?._id || '');
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [recurring, setRecurring] = useState<'none' | 'weekly' | 'monthly' | 'yearly'>('none');
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter((c) => c.name !== 'Transfer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Enter a title'); return; }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return; }
    if (!categoryId) { toast.error('Select a category'); return; }
    if (!walletId) { toast.error('Select a wallet'); return; }

    setLoading(true);
    try {
      await dispatch(createUpcoming({
        title: title.trim(),
        amount: parseFloat(amount),
        categoryId,
        walletId,
        dueDate,
        note,
        recurring,
      })).unwrap();
      toast.success('Upcoming expense added!');
      router.push('/upcoming');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input
          placeholder="e.g. Internet Bill"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl"
        />
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label>Amount (৳)</Label>
        <Input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-2xl font-bold h-14 text-center rounded-xl"
          min="0"
          step="0.01"
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>
          Category
          {categoryId && (
            <span className="ml-2 text-xs text-primary font-normal">
              {filteredCategories.find((c) => c._id === categoryId)?.icon}{' '}
              {filteredCategories.find((c) => c._id === categoryId)?.name}
            </span>
          )}
        </Label>
        {categoriesLoading && filteredCategories.length === 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No categories found. Add one in Settings.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {filteredCategories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => setCategoryId(cat._id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-medium',
                  categoryId === cat._id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="truncate w-full text-center text-[10px]">{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Wallet */}
      <div className="space-y-1.5">
        <Label>Pay from Wallet</Label>
        {walletsLoading && wallets.length === 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {wallets.map((w) => (
              <button
                key={w._id}
                type="button"
                onClick={() => setWalletId(w._id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-xs font-medium',
                  walletId === w._id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span className="text-lg">{w.icon}</span>
                <span className="truncate w-full text-center">{w.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Due Date */}
      <div className="space-y-1.5">
        <Label>Due Date</Label>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-xl"
        />
      </div>

      {/* Recurring */}
      <div className="space-y-1.5">
        <Label>Recurring</Label>
        <div className="grid grid-cols-4 gap-2">
          {(['none', 'weekly', 'monthly', 'yearly'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRecurring(r)}
              className={cn(
                'py-2 px-1 rounded-xl border-2 text-xs font-medium capitalize transition-all',
                recurring === r
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              {r === 'none' ? 'Once' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <Label>Note (optional)</Label>
        <Textarea
          placeholder="Any additional note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded-xl resize-none"
          rows={2}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-base font-semibold">
        {loading ? 'Saving...' : 'Add Upcoming Expense'}
      </Button>
    </form>
  );
}
