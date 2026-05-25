import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UpcomingExpense from '@/models/UpcomingExpense';
import Transaction from '@/models/Transaction';
import Wallet from '@/models/Wallet';
import '@/models/Category'; // register model so populate('categoryId') works

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Parse optional walletId override from request body
    let bodyWalletId: string | undefined;
    try {
      const body = await req.json();
      bodyWalletId = body?.walletId;
    } catch {}

    // Fetch without populating walletId first so we have the raw ObjectId
    const upcoming = await UpcomingExpense.findById(params.id).populate('categoryId', 'name icon color');

    if (!upcoming) {
      return NextResponse.json({ error: 'Upcoming expense not found' }, { status: 404 });
    }
    if (upcoming.status === 'paid') {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 });
    }

    // Use the wallet chosen by the user, or fall back to the one stored on the expense
    const walletId = bodyWalletId || upcoming.walletId.toString();
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Deduct from wallet
    wallet.balance -= upcoming.amount;
    await wallet.save();

    // Create expense transaction
    const transaction = await Transaction.create({
      walletId: wallet._id,
      type: 'expense',
      amount: upcoming.amount,
      categoryId: upcoming.categoryId,
      date: new Date(),
      note: `Paid: ${upcoming.title}`,
    });

    // Mark upcoming as paid, update walletId in case user chose a different wallet
    upcoming.status = 'paid';
    upcoming.walletId = wallet._id as any;
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
