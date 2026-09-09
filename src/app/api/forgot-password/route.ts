import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { email, phone, newPassword } = await req.json();

    if (!email || !phone || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Fill all the fields' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: '6 characters minimum' },
        { status: 400 }
      );
    }

    // Check karein ke email AUR phone dono ek hi user ke sath match karte hain
    const existingUser = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.phone, phone)));

    if (existingUser.length === 0) {
      return NextResponse.json(
        { success: false, message: 'invalid Email and Number' },
        { status: 404 }
      );
    }

    const user = existingUser[0];

    // Password update kar dein
    await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, user.id));

    return NextResponse.json(
      { success: true, message: 'Change Password successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server Busy' },
      { status: 500 }
    );
  }
}