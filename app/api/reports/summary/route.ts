import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import Wallet from '@/models/Wallet';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const start = startDate
      ? new Date(startDate)
      : startOfMonth(new Date());
    const end = endDate
      ? new Date(endDate + 'T23:59:59.999Z')
      : endOfMonth(new Date());

    // Total income and expenses in range
    const summaryData = await Transaction.aggregate([
      { $match: { date: { $gte: start, $lte: end }, type: { $in: ['income', 'expense'] } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    summaryData.forEach((item) => {
      if (item._id === 'income') totalIncome = item.total;
      if (item._id === 'expense') totalExpenses = item.total;
    });

    // By category (expenses)
    const byCategory = await Transaction.aggregate([
      { $match: { type: 'expense', date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$categoryId',
          amount: { $sum: '$amount' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 0,
          category: '$category.name',
          icon: '$category.icon',
          color: '$category.color',
          amount: 1,
        },
      },
      { $sort: { amount: -1 } },
    ]);

    // By month (last 6 months)
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
    const byMonth = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo },
          type: { $in: ['income', 'expense'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Transform by month data
    const monthMap: Record<string, { month: string; income: number; expenses: number }> = {};
    byMonth.forEach((item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (!monthMap[key]) {
        monthMap[key] = {
          month: format(new Date(item._id.year, item._id.month - 1), 'MMM yy'),
          income: 0,
          expenses: 0,
        };
      }
      if (item._id.type === 'income') monthMap[key].income = item.total;
      if (item._id.type === 'expense') monthMap[key].expenses = item.total;
    });

    // Fill missing months
    for (let i = 0; i < 6; i++) {
      const d = subMonths(new Date(), 5 - i);
      const key = format(d, 'yyyy-MM');
      if (!monthMap[key]) {
        monthMap[key] = { month: format(d, 'MMM yy'), income: 0, expenses: 0 };
      }
    }

    const byMonthArray = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);

    // Wallet balances
    const wallets = await Wallet.find();
    const walletBalances = wallets.map((w) => ({
      wallet: w.name,
      color: w.color,
      balance: w.balance,
    }));

    return NextResponse.json({
      data: {
        totalIncome,
        totalExpenses,
        netSavings: totalIncome - totalExpenses,
        byCategory,
        byMonth: byMonthArray,
        walletBalances,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch report' }, { status: 500 });
  }
}
