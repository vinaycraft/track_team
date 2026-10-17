import { NextResponse } from 'next/server';
import { dbOperations } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await dbOperations.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Create new team member with pending status
    const userId = await dbOperations.createUser(name, email, password, 'team');
    
    return NextResponse.json({ 
      message: 'Registration successful. Please wait for admin approval.',
      userId 
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
