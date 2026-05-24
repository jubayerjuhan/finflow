import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Wallet from '@/models/Wallet';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const wallet = await Wallet.findById(params.id);
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    return NextResponse.json({ data: wallet });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();
    const wallet = await Wallet.findByIdAndUpdate(params.id, body, { new: true });
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    return NextResponse.json({ data: wallet });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await Wallet.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Wallet deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete wallet' }, { status: 500 });
  }
}
