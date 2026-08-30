'use client';

import { Wallet } from '@/store/slices/walletsSlice';
import { cn } from '@/lib/utils';
import IconGlyph from '@/components/shared/IconGlyph';

interface WalletCardProps {
  wallet: Wallet;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function WalletCard({ wallet, isSelected, onClick }: WalletCardProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: wallet.currency || 'BDT',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-2xl p-4 cursor-pointer transition-all duration-200 w-full',
        'border-2',
        isSelected
          ? 'border-white/40 shadow-lg scale-[1.02]'
          : 'border-transparent hover:scale-[1.01]'
      )}
      style={{ backgroundColor: wallet.color }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <IconGlyph icon={wallet.icon} size={22} className="text-white" />
          <span className="text-xs font-medium text-white/70 bg-white/20 px-2 py-0.5 rounded-full">
            {wallet.currency}
          </span>
        </div>
        <div>
          <p className="text-white/80 text-xs font-medium mb-0.5">{wallet.name}</p>
          <p className="text-white font-bold text-lg leading-tight">
            {formatAmount(wallet.balance)}
          </p>
        </div>
      </div>
    </div>
  );
}
