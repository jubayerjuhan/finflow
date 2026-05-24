'use client';

import { useRouter } from 'next/navigation';
import TransactionForm from '@/components/transactions/TransactionForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewTransactionPage() {
  const router = useRouter();

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-xl"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">New Transaction</h1>
      </div>
      <TransactionForm />
    </div>
  );
}
