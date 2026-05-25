import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UpcomingExpense from '@/models/UpcomingExpense';
import '@/models/Category';
import '@/models/Wallet';

// POST /api/upcoming/[id]/contribute — add a savings contribution
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { amount, note } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    const upcoming = await UpcomingExpense.findById(params.id);
    if (!upcoming) {
      return NextResponse.json({ error: 'Upcoming expense not found' }, { status: 404 });
    }
    if (upcoming.status !== 'pending') {
      return NextResponse.json({ error: 'Can only add funds to pending expenses' }, { status: 400 });
    }

    upcoming.contributions.push({ amount, note, date: new Date() } as any);
    await upcoming.save();

    const populated = await UpcomingExpense.findById(upcoming._id)
      .populate('categoryId', 'name icon color')
      .populate('walletId', 'name icon color balance currency');

    return NextResponse.json({ data: populated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add contribution' }, { status: 500 });
  }
}

// DELETE /api/upcoming/[id]/contribute?contributionId=xxx — remove a contribution
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const contributionId = searchParams.get('contributionId');

    if (!contributionId) {
      return NextResponse.json({ error: 'contributionId is required' }, { status: 400 });
    }

    const upcoming = await UpcomingExpense.findById(params.id);
    if (!upcoming) {
      return NextResponse.json({ error: 'Upcoming expense not found' }, { status: 404 });
    }

    const before = upcoming.contributions.length;
    upcoming.contributions = upcoming.contributions.filter(
      (c: any) => c._id.toString() !== contributionId
    ) as any;

    if (upcoming.contributions.length === before) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    await upcoming.save();

    const populated = await UpcomingExpense.findById(upcoming._id)
      .populate('categoryId', 'name icon color')
      .populate('walletId', 'name icon color balance currency');

    return NextResponse.json({ data: populated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to remove contribution' }, { status: 500 });
  }
}
