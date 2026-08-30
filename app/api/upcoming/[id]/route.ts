import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, HttpError } from '@/lib/auth';
import UpcomingExpense from '@/models/UpcomingExpense';
import '@/models/Category';
import '@/models/Wallet';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    const upcoming = await UpcomingExpense.findOne({ _id: params.id, userId: user._id })
      .populate('categoryId', 'name icon color')
      .populate('walletId', 'name icon color balance currency');
    if (!upcoming) return NextResponse.json({ error: 'Upcoming expense not found' }, { status: 404 });
    return NextResponse.json({ data: upcoming });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to fetch upcoming expense' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    const body = await req.json();
    const upcoming = await UpcomingExpense.findOneAndUpdate({ _id: params.id, userId: user._id }, body, { new: true })
      .populate('categoryId', 'name icon color')
      .populate('walletId', 'name icon color balance currency');
    if (!upcoming) return NextResponse.json({ error: 'Upcoming expense not found' }, { status: 404 });
    return NextResponse.json({ data: upcoming });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to update upcoming expense' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    await UpcomingExpense.findOneAndDelete({ _id: params.id, userId: user._id });
    return NextResponse.json({ message: 'Upcoming expense deleted' });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to delete upcoming expense' }, { status: 500 });
  }
}
