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
import {
  Calendar,
  Repeat2,
  StickyNote,
  Wallet,
  Tag,
  DollarSign,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export default function UpcomingForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const wallets = useAppSelector((s) => s.wallets.items);
  const categories = useAppSelector((s) => s.categories.items);
  const categoriesLoading = useAppSelector((s) => s.categories.loading);
  const walletsLoading = useAppSelector((s) => s.wallets.loading);

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

  const recurringOptions = [
    { value: 'none', label: 'Once', icon: '1️⃣' },
    { value: 'weekly', label: 'Weekly', icon: '📅' },
    { value: 'monthly', label: 'Monthly', icon: '🗓️' },
    { value: 'yearly', label: 'Yearly', icon: '📆' },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Title */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-sm font-semibold">
          <FileText size={14} className="text-primary" /> Title
        </Label>
        <Input
          placeholder="e.g. Internet Bill"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl h-11"
        />
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-sm font-semibold">
          <DollarSign size={14} className="text-primary" /> Amount (৳)
        </Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground select-none">৳</span>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-2xl font-bold h-16 text-center rounded-xl pl-8 pr-4"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5 text-sm font-semibold">
          <Tag size={14} className="text-primary" />
          Category
          {categoryId && (
            <span className="ml-2 text-xs text-primary font-normal flex items-center gap-1">
              <CheckCircle2 size={11} />
              {filteredCategories.find((c) => c._id === categoryId)?.icon}{' '}
              {filteredCategories.find((c) => c._id === categoryId)?.name}
            </span>
          )}
        </Label>
        {categoriesLoading && filteredCategories.length === 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No categories found. Add one in Settings.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {filteredCategories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => setCategoryId(cat._id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-medium min-w-0',
                  categoryId === cat._id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: cat.color + '22' }}
                >
                  {cat.icon}
                </span>
                <span className="truncate w-full text-center text-[10px] leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Wallet */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5 text-sm font-semibold">
          <Wallet size={14} className="text-primary" /> Pay from Wallet
        </Label>
        {walletsLoading && wallets.length === 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {wallets.map((w) => (
              <button
                key={w._id}
                type="button"
                onClick={() => setWalletId(w._id)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-xs font-medium min-w-0',
                  walletId === w._id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: w.color + '22' }}
                >
                  {w.icon}
                </span>
                <div className="min-w-0 text-left">
                  <p className="truncate font-semibold text-xs">{w.name}</p>
                  <p className="text-muted-foreground text-[10px]">৳{w.balance.toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Due Date */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-sm font-semibold">
          <Calendar size={14} className="text-primary" /> Due Date
        </Label>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-xl h-11"
        />
      </div>

      {/* Recurring */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5 text-sm font-semibold">
          <Repeat2 size={14} className="text-primary" /> Recurring
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {recurringOptions.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRecurring(r.value)}
              className={cn(
                'flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl border-2 text-xs font-medium transition-all',
                recurring === r.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              )}
            >
              <span>{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-sm font-semibold">
          <StickyNote size={14} className="text-primary" /> Note
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          placeholder="Any additional note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded-xl resize-none"
          rows={2}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-base font-semibold gap-2">
        {loading ? (
          <>Saving...</>
        ) : (
          <>
            <CheckCircle2 size={18} /> Add Upcoming Expense
          </>
        )}
      </Button>
    </form>
  );
}
