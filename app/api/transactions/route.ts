import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import Wallet from '@/models/Wallet';
import '@/models/Category'; // register for populate('categoryId')

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const walletId = searchParams.get('walletId');
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: any = {};
    if (walletId) query.walletId = walletId;
    if (categoryId) query.categoryId = categoryId;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('walletId', 'name color icon currency')
      .populate('toWalletId', 'name color icon currency')
      .populate('categoryId', 'name icon color')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      data: transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { walletId, type, amount } = body;

    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Update wallet balance
    if (type === 'income') {
      wallet.balance += amount;
    } else if (type === 'expense') {
      wallet.balance -= amount;
    }
    await wallet.save();

    const transaction = await Transaction.create(body);
    const populated = await transaction.populate([
      { path: 'walletId', select: 'name color icon currency' },
      { path: 'categoryId', select: 'name icon color' },
    ]);

    return NextResponse.json({ data: populated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create transaction' }, { status: 500 });
  }
}
