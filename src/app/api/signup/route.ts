import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

// 1. GET: Sabhi users ki list fetch karne ke liye
export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    return NextResponse.json({ success: true, data: allUsers }, { status: 200 });
  } catch (error) {
    console.error('Fetch Users Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users from database.' },
      { status: 500 }
    );
  }
}

// 2. POST: Naya user add/signup karne ke liye
export async function POST(req: Request) {
  try {
    const { name, cnic, phone, password } = await req.json();

    // Fields validation
    if (!name || !cnic || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Check if user already registered with this CNIC OR Phone Number in users table
    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.cnic, cnic), eq(users.phone, phone)));

    if (existingUser.length > 0) {
      const matchedByCnic = existingUser.some((u) => u.cnic === cnic);
      const message = matchedByCnic
        ? 'This CNIC is already registered.'
        : 'This phone number is already registered.';

      return NextResponse.json(
        { success: false, message },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name,
        cnic,
        phone,
        password,
        createdAt: new Date().toISOString(),
      })
      .returning();

    const result = Array.isArray(newUser) ? newUser[0] : newUser;

    return NextResponse.json(
      { success: true, message: 'Account created successfully.', data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while saving to the database.' },
      { status: 500 }
    );
  }
}