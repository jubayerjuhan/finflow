import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, HttpError } from '@/lib/auth';
import Wallet from '@/models/Wallet';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    const wallets = await Wallet.find({ userId: user._id }).sort({ createdAt: 1 });
    return NextResponse.json({ data: wallets });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to fetch wallets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    const body = await req.json();
    const wallet = await Wallet.create({ ...body, userId: user._id });
    return NextResponse.json({ data: wallet }, { status: 201 });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message || 'Failed to create wallet' }, { status: 500 });
  }
}
