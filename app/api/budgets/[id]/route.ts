import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, HttpError } from '@/lib/auth';
import Budget from '@/models/Budget';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    const body = await req.json();
    const budget = await Budget.findOneAndUpdate({ _id: params.id, userId: user._id }, body, { new: true }).populate('categoryId', 'name icon color');
    if (!budget) return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    return NextResponse.json({ data: budget });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    await Budget.findOneAndDelete({ _id: params.id, userId: user._id });
    return NextResponse.json({ message: 'Budget deleted' });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
