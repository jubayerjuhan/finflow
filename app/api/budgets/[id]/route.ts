import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Budget from '@/models/Budget';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();
    const budget = await Budget.findByIdAndUpdate(params.id, body, { new: true }).populate('categoryId', 'name icon color');
    if (!budget) return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    return NextResponse.json({ data: budget });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    await Budget.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Budget deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
