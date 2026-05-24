import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ isDefault: -1, name: 1 });
    return NextResponse.json({ data: categories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const category = await Category.create(body);
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}
