import { NextResponse } from 'next/server';
import { dbOperations } from '@/lib/db';

export async function GET() {
  try {
    const users = await dbOperations.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST route removed - user creation now handled by /api/auth/register
