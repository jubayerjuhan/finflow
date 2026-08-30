import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, HttpError } from '@/lib/auth';
import Transaction from '@/models/Transaction';
import Wallet from '@/models/Wallet';
import '@/models/Category'; // register for populate('categoryId')

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    const transaction = await Transaction.findOne({ _id: params.id, userId: user._id })
      .populate('walletId', 'name color icon currency')
      .populate('categoryId', 'name icon color');
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ data: transaction });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
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

    const existing = await Transaction.findOne({ _id: params.id, userId: user._id });
    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Reverse previous balance effect
    const oldFee = existing.fee || 0;
    const oldWallet = await Wallet.findOne({ _id: existing.walletId.toString(), userId: user._id });
    if (oldWallet) {
      if (existing.type === 'income') oldWallet.balance -= (existing.amount - oldFee);
      else if (existing.type === 'expense') oldWallet.balance += (existing.amount + oldFee);
      await oldWallet.save();
    }

    // Apply new balance effect
    const newWalletId = body.walletId || existing.walletId;
    const newAmount = body.amount || existing.amount;
    const newType = body.type || existing.type;
    const newFee = body.fee ?? existing.fee ?? 0;
    const newWallet = await Wallet.findOne({ _id: newWalletId, userId: user._id });
    if (newWallet) {
      if (newType === 'income') newWallet.balance += (newAmount - newFee);
      else if (newType === 'expense') newWallet.balance -= (newAmount + newFee);
      await newWallet.save();
    }

    const transaction = await Transaction.findOneAndUpdate({ _id: params.id, userId: user._id }, body, { new: true })
      .populate('walletId', 'name color icon currency')
      .populate('categoryId', 'name icon color');

    return NextResponse.json({ data: transaction });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    const transaction = await Transaction.findOne({ _id: params.id, userId: user._id });
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Reverse balance effect
    const wallet = await Wallet.findOne({ _id: transaction.walletId.toString(), userId: user._id });
    if (wallet) {
      if (transaction.type === 'income') wallet.balance -= transaction.amount;
      else if (transaction.type === 'expense') wallet.balance += transaction.amount;
      await wallet.save();
    }

    await Transaction.findOneAndDelete({ _id: params.id, userId: user._id });
    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
