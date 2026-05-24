'use client';

import { useRouter } from 'next/navigation';
import UpcomingForm from '@/components/upcoming/UpcomingForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarClock } from 'lucide-react';

export default function NewUpcomingPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-6 pb-8 overflow-x-hidden">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-xl flex-shrink-0"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CalendarClock size={16} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold truncate">New Upcoming Expense</h1>
        </div>
      </div>
      <UpcomingForm />
    </div>
  );
}
