import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UpcomingExpense from '@/models/UpcomingExpense';
import Transaction from '@/models/Transaction';
import Wallet from '@/models/Wallet';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const upcoming = await UpcomingExpense.findById(params.id)
      .populate('categoryId', 'name icon color')
      .populate('walletId', 'name icon color balance currency');

    if (!upcoming) {
      return NextResponse.json({ error: 'Upcoming expense not found' }, { status: 404 });
    }

    if (upcoming.status === 'paid') {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 });
    }

    const wallet = await Wallet.findById(upcoming.walletId);
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Deduct from wallet
    wallet.balance -= upcoming.amount;
    await wallet.save();

    // Create transaction
    const transaction = await Transaction.create({
      walletId: upcoming.walletId,
      type: 'expense',
      amount: upcoming.amount,
      categoryId: upcoming.categoryId,
      date: new Date(),
      note: `Paid: ${upcoming.title}`,
    });

    // Mark upcoming as paid
    upcoming.status = 'paid';
    upcoming.paidTransactionId = transaction._id as any;
    await upcoming.save();

    const populatedUpcoming = await UpcomingExpense.findById(upcoming._id)
      .populate('categoryId', 'name icon color')
      .populate('walletId', 'name icon color balance currency');

    return NextResponse.json({
      data: { upcoming: populatedUpcoming, transaction },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to mark as paid' }, { status: 500 });
  }
}
