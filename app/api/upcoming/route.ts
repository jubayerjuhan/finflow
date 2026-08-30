import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, HttpError } from '@/lib/auth';
import UpcomingExpense from '@/models/UpcomingExpense';
import '@/models/Category';
import '@/models/Wallet';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    const upcoming = await UpcomingExpense.find({ userId: user._id })
      .populate('categoryId', 'name icon color')
      .populate('walletId', 'name icon color balance currency')
      .sort({ dueDate: 1 });
    return NextResponse.json({ data: upcoming });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to fetch upcoming expenses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    const body = await req.json();
    const upcoming = await UpcomingExpense.create({ ...body, userId: user._id });
    const populated = await upcoming.populate([
      { path: 'categoryId', select: 'name icon color' },
      { path: 'walletId', select: 'name icon color balance currency' },
    ]);
    return NextResponse.json({ data: populated }, { status: 201 });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message || 'Failed to create upcoming expense' }, { status: 500 });
  }
}
