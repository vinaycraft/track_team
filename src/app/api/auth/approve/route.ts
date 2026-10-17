import { NextResponse } from 'next/server';
import { dbOperations } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action } = body; // action: 'approve' or 'reject'

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    await dbOperations.updateUserStatus(userId, status);
    
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const pendingUsers = await dbOperations.getPendingUsers();
    return NextResponse.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return NextResponse.json({ error: 'Failed to fetch pending users' }, { status: 500 });
  }
}
