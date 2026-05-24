import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Budget from '@/models/Budget';
import Transaction from '@/models/Transaction';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || format(new Date(), 'yyyy-MM');

    const budgets = await Budget.find({ month }).populate(
      'categoryId',
      'name icon color'
    );

    // Calculate spent per category for the month
    const [year, mo] = month.split('-').map(Number);
    const start = startOfMonth(new Date(year, mo - 1));
    const end = endOfMonth(new Date(year, mo - 1));

    const spentData = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$categoryId',
          spent: { $sum: '$amount' },
        },
      },
    ]);

    const spentMap: Record<string, number> = {};
    spentData.forEach((item) => {
      spentMap[item._id.toString()] = item.spent;
    });

    const budgetsWithSpent = budgets.map((b) => ({
      ...b.toObject(),
      spent: spentMap[(b.categoryId as any)._id?.toString()] || 0,
    }));

    return NextResponse.json({ data: budgetsWithSpent });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const budget = await Budget.create(body);
    const populated = await budget.populate('categoryId', 'name icon color');
    return NextResponse.json({ data: populated }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Budget for this category and month already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message || 'Failed to create budget' }, { status: 500 });
  }
}
