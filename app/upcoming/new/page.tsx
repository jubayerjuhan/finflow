'use client';

import { useRouter } from 'next/navigation';
import UpcomingForm from '@/components/upcoming/UpcomingForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewUpcomingPage() {
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
        <h1 className="text-xl font-bold">New Upcoming Expense</h1>
      </div>
      <UpcomingForm />
    </div>
  );
}
