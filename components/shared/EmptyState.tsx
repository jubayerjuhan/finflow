import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  illustration: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}

export default function EmptyState({ illustration, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center text-center py-12 px-4', className)}>
      <div className="w-24 h-24 text-muted-foreground mb-2">{illustration}</div>
      <p className="font-semibold text-foreground">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
      )}
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant="link" size="sm" className="mt-2">{action.label}</Button>
          </Link>
        ) : (
          <Button variant="link" size="sm" className="mt-2" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
