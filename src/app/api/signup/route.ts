import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'Tamam fields lazmi hain' },
        { status: 400 }
      );
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Yeh email pehle se registered hai' },
        { status: 400 }
      );
    }

    const newUser = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        name,
        email,
        phone, // <--- Yahan phone save hoga
        password,
        createdAt: new Date().toISOString(),
      })
      .returning();

    const result = Array.isArray(newUser) ? newUser[0] : newUser;

    return NextResponse.json(
      { success: true, message: 'Account kamyabi se ban gaya', data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json(
      { success: false, message: 'Database mein save karte waqt masla hua' },
      { status: 500 }
    );
  }
}