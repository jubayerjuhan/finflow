import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UpcomingExpense from '@/models/UpcomingExpense';
import Wallet from '@/models/Wallet';

export async function GET() {
  try {
    await connectDB();

    const upcomingExpenses = await UpcomingExpense.find({ status: 'pending' })
      .populate('categoryId', 'name icon color')
      .populate('walletId', 'name icon color balance currency');

    const wallets = await Wallet.find();

    // Total upcoming amount
    const totalUpcoming = upcomingExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Total available balance
    const totalAvailableBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

    // By category
    const categoryMap: Record<string, { category: string; icon: string; color: string; amount: number }> = {};
    upcomingExpenses.forEach((exp) => {
      const cat = exp.categoryId as any;
      const key = cat._id.toString();
      if (!categoryMap[key]) {
        categoryMap[key] = { category: cat.name, icon: cat.icon, color: cat.color, amount: 0 };
      }
      categoryMap[key].amount += exp.amount;
    });
    const byCategory = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);

    // Projected balances per wallet
    const walletDeductions: Record<string, number> = {};
    upcomingExpenses.forEach((exp) => {
      const walletId = (exp.walletId as any)._id.toString();
      walletDeductions[walletId] = (walletDeductions[walletId] || 0) + exp.amount;
    });

    const projectedBalances = wallets.map((w) => ({
      wallet: w.name,
      color: w.color,
      current: w.balance,
      projected: w.balance - (walletDeductions[w._id.toString()] || 0),
    }));

    return NextResponse.json({
      data: {
        totalUpcoming,
        totalAvailableBalance,
        byCategory,
        projectedBalances,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch upcoming report' }, { status: 500 });
  }
}
