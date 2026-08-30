import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { adminAuth } from '@/lib/firebase/admin';
import User, { IUser } from '@/models/User';
import { seedDefaultCategories } from '@/lib/seedDefaults';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function getAuthUser(req: NextRequest): Promise<IUser> {
  const authHeader = req.headers.get('authorization') || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Missing or invalid Authorization header');
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }

  await connectDB();

  let user = await User.findOne({ firebaseUid: decoded.uid });
  let isNewUser = false;

  if (!user) {
    try {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email ?? '',
        name: decoded.name,
        photoURL: decoded.picture,
      });
      isNewUser = true;
    } catch (err: any) {
      // Duplicate key = another concurrent request created it first (e.g. two tabs).
      if (err?.code === 11000) {
        user = await User.findOne({ firebaseUid: decoded.uid });
      } else {
        throw err;
      }
    }
  }

  if (!user) {
    throw new HttpError(500, 'Failed to resolve user account');
  }

  if (isNewUser) {
    await seedDefaultCategories(user._id);
  }

  return user;
}
