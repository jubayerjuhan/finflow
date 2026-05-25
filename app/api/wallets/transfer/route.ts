import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import Category from '@/models/Category';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { fromId, toId, amount, note, fee = 0 } = await req.json();

    const fromWallet = await Wallet.findById(fromId);
    const toWallet = await Wallet.findById(toId);

    if (!fromWallet || !toWallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    if (fromWallet.balance < amount + fee) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Find or create a Transfer category
    let transferCategory = await Category.findOne({ name: 'Transfer' });
    if (!transferCategory) {
      transferCategory = await Category.create({
        name: 'Transfer',
        icon: '🔄',
        color: '#6366f1',
        isDefault: true,
      });
    }

    // Deduct amount + fee from source
    fromWallet.balance -= (amount + fee);
    await fromWallet.save();

    // Add only the amount to destination (fee stays with source)
    toWallet.balance += amount;
    await toWallet.save();

    // Create transfer transaction record
    await Transaction.create({
      walletId: fromId,
      toWalletId: toId,
      type: 'transfer',
      amount,
      fee: fee || 0,
      categoryId: transferCategory._id,
      date: new Date(),
      note: note || `Transfer to ${toWallet.name}`,
    });

    return NextResponse.json({
      data: { fromWallet, toWallet },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Transfer failed' }, { status: 500 });
  }
}
