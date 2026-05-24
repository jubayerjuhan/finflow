'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchBudgets,
  createBudget,
  deleteBudget,
  setSelectedMonth,
  Budget,
} from '@/store/slices/budgetsSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/shared/LoadingSkeleton';
import { Plus, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BudgetsPage() {
  const dispatch = useAppDispatch();
  const { items: budgets, loading, selectedMonth } = useAppSelector((s) => s.budgets);
  const categories = useAppSelector((s) => s.categories.items);

  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const loadBudgets = (month: string) => {
    dispatch(fetchBudgets(month));
  };

  useEffect(() => {
    loadBudgets(selectedMonth);
  }, [selectedMonth]);

  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prev = format(subMonths(new Date(y, m - 1), 1), 'yyyy-MM');
    dispatch(setSelectedMonth(prev));
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const next = format(addMonths(new Date(y, m - 1), 1), 'yyyy-MM');
    dispatch(setSelectedMonth(next));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) { toast.error('Select a category'); return; }
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return; }

    setSaving(true);
    try {
      await dispatch(createBudget({
        categoryId,
        amount: parseFloat(amount),
        month: selectedMonth,
      })).unwrap();
      toast.success('Budget created!');
      setOpen(false);
      setCategoryId('');
      setAmount('');
      loadBudgets(selectedMonth);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create budget');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await dispatch(deleteBudget(id)).unwrap();
      toast.success('Budget deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);

  // Categories not yet budgeted this month
  const budgetedCatIds = budgets.map((b) => (b.categoryId as any)?._id || b.categoryId);
  const availableCategories = categories.filter(
    (c) => !budgetedCatIds.includes(c._id) && c.name !== 'Transfer' && c.name !== 'Salary'
  );

  const [y, m] = selectedMonth.split('-').map(Number);
  const displayMonth = format(new Date(y, m - 1), 'MMMM yyyy');

  return (
    <div className="px-4 sm:px-6 pt-6 pb-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-xl">
              <Plus size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl max-h-[90dvh] flex flex-col p-0 gap-0">
            <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
              <DialogTitle>New Budget</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 px-6 pb-6">
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {availableCategories.map((cat) => (
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
                {availableCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    All categories have budgets for this month
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Budget Amount (৳)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-xl text-lg font-semibold text-center h-12"
                  min="0"
                />
              </div>
              <Button type="submit" disabled={saving || availableCategories.length === 0} className="w-full rounded-xl">
                {saving ? 'Creating...' : 'Create Budget'}
              </Button>
            </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-between bg-muted rounded-2xl p-1">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-xl">
          <ChevronLeft size={16} />
        </Button>
        <span className="font-semibold text-sm">{displayMonth}</span>
        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-xl">
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-muted/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Budgeted</p>
          <p className="font-bold text-base">৳{totalBudgeted.toLocaleString()}</p>
        </div>
        <div className="bg-red-500/10 rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Spent</p>
          <p className="font-bold text-base text-red-500">৳{totalSpent.toLocaleString()}</p>
        </div>
        <div className={cn('rounded-xl p-3', totalBudgeted - totalSpent >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className={cn('font-bold text-base', totalBudgeted - totalSpent >= 0 ? 'text-emerald-600' : 'text-red-500')}>
            ৳{(totalBudgeted - totalSpent).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Budget list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-medium">No budgets yet</p>
          <p className="text-sm mt-1">Tap + to set spending limits</p>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => {
            const spent = budget.spent || 0;
            const pct = Math.min((spent / budget.amount) * 100, 100);
            const isOver = spent > budget.amount;
            const cat = budget.categoryId as any;

            return (
              <Card key={budget._id} className={cn('border', isOver && 'border-red-500/40 bg-red-500/5')}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: cat?.color + '22' }}
                    >
                      {cat?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{cat?.name}</span>
                        {isOver && (
                          <AlertTriangle size={13} className="text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ৳{spent.toLocaleString()} of ৳{budget.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={cn('font-bold text-sm', isOver ? 'text-red-500' : 'text-foreground')}>
                        {isOver ? `-৳${(spent - budget.amount).toLocaleString()}` : `৳${(budget.amount - spent).toLocaleString()}`}
                      </span>
                      <span className="text-xs text-muted-foreground">{isOver ? 'over' : 'left'}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(budget._id)}
                      className="text-muted-foreground hover:text-red-500 p-1 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Progress
                    value={pct}
                    className={cn('h-2 rounded-full', isOver ? '[&>div]:bg-red-500' : pct > 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500')}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">{pct.toFixed(0)}%</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
