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
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 rounded-xl transition-colors group">
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: category?.color + '22', border: `1.5px solid ${category?.color}44` }}
      >
        <span>{category?.icon || '📦'}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {transaction.note || category?.name || 'Transaction'}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground">{wallet?.name}</span>
          <span className="text-muted-foreground/40 text-xs">•</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(transaction.date), 'MMM d')}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-1">
        {isTransfer ? (
          <ArrowLeftRight size={13} className="text-muted-foreground" />
        ) : isIncome ? (
          <ArrowUpRight size={13} className="text-emerald-500" />
        ) : (
          <ArrowDownLeft size={13} className="text-red-500" />
        )}
        <span
          className={cn(
            'text-sm font-semibold',
            isTransfer
              ? 'text-foreground'
              : isIncome
              ? 'text-emerald-500'
              : 'text-red-500'
          )}
        >
          ৳{transaction.amount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
