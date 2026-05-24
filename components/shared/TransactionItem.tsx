'use client';

import { Transaction } from '@/store/slices/transactionsSlice';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: string) => void;
}

export default function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';
  const category = transaction.categoryId;
  const wallet = transaction.walletId;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3.5',
        'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]',
        'transition-colors duration-100',
        'cursor-default select-none',
        'active:bg-black/[0.05] dark:active:bg-white/[0.05]',
      )}
    >
      {/* Category icon — Apple SF-symbol style circle */}
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg shrink-0"
        style={{
          backgroundColor: (category?.color ?? '#8E8E93') + '1A',
        }}
      >
        <span>{category?.icon || '📦'}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium leading-snug truncate text-foreground">
          {transaction.note || category?.name || 'Transaction'}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[12px] text-muted-foreground">{wallet?.name}</span>
          <span className="text-muted-foreground/40 text-[10px]">·</span>
          <span className="text-[12px] text-muted-foreground">
            {format(new Date(transaction.date), 'MMM d')}
          </span>
        </div>
      </div>

      {/* Amount — Apple-style right aligned */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span
          className={cn(
            'text-[14px] font-semibold tracking-tight',
            isTransfer
              ? 'text-foreground'
              : isIncome
              ? 'text-[#34C759] dark:text-[#30D158]'
              : 'text-[#FF3B30] dark:text-[#FF453A]',
          )}
        >
          {isTransfer ? '' : isIncome ? '+' : '−'}৳{transaction.amount.toLocaleString()}
        </span>
        {isTransfer && (
          <ArrowLeftRight size={10} className="text-muted-foreground" />
        )}
      </div>
    </div>
  );
}
