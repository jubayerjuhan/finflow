import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, HttpError } from '@/lib/auth';
import Category from '@/models/Category';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    const categories = await Category.find({ userId: user._id }).sort({ isDefault: -1, name: 1 });
    return NextResponse.json({ data: categories });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    const body = await req.json();
    const category = await Category.create({ ...body, userId: user._id });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}
