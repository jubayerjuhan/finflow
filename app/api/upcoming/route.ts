import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UpcomingExpense from '@/models/UpcomingExpense';
import '@/models/Category';
import '@/models/Wallet';

export async function GET() {
  try {
    await connectDB();
    const upcoming = await UpcomingExpense.find()
      .populate('categoryId', 'name icon color')
      .populate('walletId', 'name icon color balance currency')
      .sort({ dueDate: 1 });
    return NextResponse.json({ data: upcoming });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch upcoming expenses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const upcoming = await UpcomingExpense.create(body);
    const populated = await upcoming.populate([
      { path: 'categoryId', select: 'name icon color' },
      { path: 'walletId', select: 'name icon color balance currency' },
    ]);
    return NextResponse.json({ data: populated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create upcoming expense' }, { status: 500 });
  }
}
