import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Wallet from '@/models/Wallet';

export async function GET() {
  try {
    await connectDB();
    const wallets = await Wallet.find().sort({ createdAt: 1 });
    return NextResponse.json({ data: wallets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wallets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const wallet = await Wallet.create(body);
    return NextResponse.json({ data: wallet }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create wallet' }, { status: 500 });
  }
}
