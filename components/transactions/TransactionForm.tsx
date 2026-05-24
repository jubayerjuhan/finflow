'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createTransaction } from '@/store/slices/transactionsSlice';
import { fetchWallets } from '@/store/slices/walletsSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

type TxType = 'expense' | 'income' | 'transfer';

export default function TransactionForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const wallets = useAppSelector((s) => s.wallets.items);
  const categories = useAppSelector((s) => s.categories.items);

  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?._id || '');
  const [toWalletId, setToWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter((c) => c.name !== 'Transfer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!walletId) {
      toast.error('Select a wallet');
      return;
    }
    if (type !== 'transfer' && !categoryId) {
      toast.error('Select a category');
      return;
    }

    setLoading(true);
    try {
      if (type === 'transfer') {
        if (!toWalletId || toWalletId === walletId) {
          toast.error('Select a different destination wallet');
          setLoading(false);
          return;
        }
        const transferCat = categories.find((c) => c.name === 'Transfer');
        await dispatch(
          createTransaction({
            walletId,
            toWalletId,
            type: 'transfer',
            amount: parseFloat(amount),
            categoryId: transferCat?._id || categories[0]._id,
            date,
            note,
          })
        ).unwrap();
        // Refresh wallets after transfer
        dispatch(fetchWallets());
      } else {
        await dispatch(
          createTransaction({
            walletId,
            type,
            amount: parseFloat(amount),
            categoryId,
            date,
            note,
          })
        ).unwrap();
        dispatch(fetchWallets());
      }
      toast.success('Transaction added!');
      router.push('/transactions');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type selector */}
      <div className="flex bg-muted rounded-2xl p-1 gap-1">
        {(['expense', 'income', 'transfer'] as TxType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-xl transition-all capitalize',
              type === t
                ? t === 'expense'
                  ? 'bg-red-500 text-white shadow-sm'
                  : t === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t}
          </button>
        ))}
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

      {/* From Wallet */}
      <div className="space-y-1.5">
        <Label>{type === 'transfer' ? 'From Wallet' : 'Wallet'}</Label>
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
      </div>

      {/* To Wallet (transfer) */}
      {type === 'transfer' && (
        <div className="space-y-1.5">
          <Label>To Wallet</Label>
          <div className="grid grid-cols-3 gap-2">
            {wallets
              .filter((w) => w._id !== walletId)
              .map((w) => (
                <button
                  key={w._id}
                  type="button"
                  onClick={() => setToWalletId(w._id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-xs font-medium',
                    toWalletId === w._id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-lg">{w.icon}</span>
                  <span className="truncate w-full text-center">{w.name}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Category */}
      {type !== 'transfer' && (
        <div className="space-y-1.5">
          <Label>Category</Label>
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
        </div>
      )}

      {/* Date */}
      <div className="space-y-1.5">
        <Label>Date</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl"
        />
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <Label>Note (optional)</Label>
        <Textarea
          placeholder="What's this for?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded-xl resize-none"
          rows={2}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl text-base font-semibold"
      >
        {loading ? 'Saving...' : 'Save Transaction'}
      </Button>
    </form>
  );
}
