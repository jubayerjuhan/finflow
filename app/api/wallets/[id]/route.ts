import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, HttpError } from '@/lib/auth';
import Wallet from '@/models/Wallet';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    const wallet = await Wallet.findOne({ _id: params.id, userId: user._id });
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    return NextResponse.json({ data: wallet });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
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
    const wallet = await Wallet.findOneAndUpdate({ _id: params.id, userId: user._id }, body, { new: true });
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    return NextResponse.json({ data: wallet });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    await Wallet.findOneAndDelete({ _id: params.id, userId: user._id });
    return NextResponse.json({ message: 'Wallet deleted' });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to delete wallet' }, { status: 500 });
  }
}
