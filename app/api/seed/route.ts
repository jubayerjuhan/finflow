import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, HttpError } from '@/lib/auth';
import { seedDefaultCategories } from '@/lib/seedDefaults';

// Idempotent: getAuthUser already seeds default categories for a brand-new
// user on their very first authenticated request. This endpoint exists so
// the client can also call it directly (e.g. on app load) without caring
// about that detail — it's a no-op for existing users.
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    await connectDB();
    await seedDefaultCategories(user._id);
    return NextResponse.json({ data: { seeded: true } });
  } catch (error: any) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message || 'Failed to seed defaults' }, { status: 500 });
  }
}
