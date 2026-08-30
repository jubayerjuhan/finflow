import Category from '@/models/Category';

const DEFAULT_CATEGORIES: Array<{ name: string; icon: string; color: string }> = [
  { name: 'Food & Dining', icon: 'utensils', color: '#f97316' },
  { name: 'Transport', icon: 'bus', color: '#3b82f6' },
  { name: 'Shopping', icon: 'shopping-bag', color: '#ec4899' },
  { name: 'Bills & Utilities', icon: 'receipt', color: '#ef4444' },
  { name: 'Health', icon: 'heart-pulse', color: '#22c55e' },
  { name: 'Entertainment', icon: 'clapperboard', color: '#a855f7' },
  { name: 'Housing', icon: 'home', color: '#6366f1' },
  { name: 'Salary', icon: 'wallet', color: '#10b981' },
  { name: 'Transfer', icon: 'repeat', color: '#64748b' },
  { name: 'Other', icon: 'package', color: '#94a3b8' },
];

export async function seedDefaultCategories(userId: string) {
  const existing = await Category.countDocuments({ userId });
  if (existing > 0) return;

  await Category.insertMany(
    DEFAULT_CATEGORIES.map((c) => ({ ...c, userId, isDefault: true }))
  );
}
