import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-muted',
        className
      )}
    />
  );
}

export function WalletCardSkeleton() {
  return (
    <div className="rounded-2xl p-4 bg-muted animate-pulse h-28 w-full" />
  );
}

export function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
      <div className="h-4 bg-muted rounded w-16" />
    </div>
  );
}
