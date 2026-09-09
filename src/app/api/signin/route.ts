import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Enter Valid Login Credentials' },
        { status: 400 }
      );
    }

    // Database mein email search karein
    const existingUser = await db.select().from(users).where(eq(users.email, email));

    if (existingUser.length === 0) {
      return NextResponse.json(
        { success: false, message: 'invalid email' },
        { status: 401 }
      );
    }

    const user = existingUser[0];

    // Password match check karein
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'invalid password' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'login successful', 
        data: { name: user.name, email: user.email } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signin Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server Busy' },
      { status: 500 }
    );
  }
}