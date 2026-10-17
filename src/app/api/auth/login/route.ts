import { NextResponse } from 'next/server';
import { dbOperations } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await dbOperations.getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.status !== 'approved') {
      return NextResponse.json({ error: 'Account is not approved' }, { status: 403 });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
