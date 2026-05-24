import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UpcomingExpense from '@/models/UpcomingExpense';
import '@/models/Category';
import '@/models/Wallet';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const upcoming = await UpcomingExpense.findById(params.id)
      .populate('categoryId', 'name icon color')
      .populate('walletId', 'name icon color balance currency');
    if (!upcoming) return NextResponse.json({ error: 'Upcoming expense not found' }, { status: 404 });
    return NextResponse.json({ data: upcoming });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch upcoming expense' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();
    const upcoming = await UpcomingExpense.findByIdAndUpdate(params.id, body, { new: true })
      .populate('categoryId', 'name icon color')
      .populate('walletId', 'name icon color balance currency');
    if (!upcoming) return NextResponse.json({ error: 'Upcoming expense not found' }, { status: 404 });
    return NextResponse.json({ data: upcoming });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update upcoming expense' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await UpcomingExpense.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Upcoming expense deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete upcoming expense' }, { status: 500 });
  }
}
