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

export function BudgetCardSkeleton() {
  return (
    <div className="rounded-2xl p-4 bg-card border border-border animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-16" />
      </div>
      <div className="h-2.5 bg-muted rounded-full w-full" />
    </div>
  );
}

export function UpcomingCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
      <div className="h-6 bg-muted rounded-full w-14" />
    </div>
  );
}

export function ReportChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl bg-muted animate-pulse w-full', className || 'h-64')} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="h-8 bg-muted rounded w-48 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <WalletCardSkeleton key={i} />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <TransactionSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
