import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customerPins } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: Check karne ke liye ke PIN pehle se bana hai ya nahi
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cnic = searchParams.get('cnic');

    if (!cnic) {
      return NextResponse.json({ success: false, message: 'CNIC is required' }, { status: 400 });
    }

    const existingPin = await db
      .select()
      .from(customerPins)
      .where(eq(customerPins.cnic, cnic))
      .get();

    if (existingPin) {
      return NextResponse.json({ success: true, hasPin: true }, { status: 200 });
    } else {
      return NextResponse.json({ success: true, hasPin: false }, { status: 200 });
    }
  } catch (error) {
    console.error('Error checking PIN:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// POST: Naya PIN set ya update karne ke liye
export async function POST(req: Request) {
  try {
    const { userId, cnic, pin } = await req.json();

    if (!cnic || !pin) {
      return NextResponse.json({ success: false, message: 'CNIC and PIN are required' }, { status: 400 });
    }

    // Check karein ke pehle se exist karta hai ya nahi
    const existing = await db
      .select()
      .from(customerPins)
      .where(eq(customerPins.cnic, cnic))
      .get();

    if (existing) {
      // Agar pehle se bana hai toh Update karein (Change PIN)
      await db
        .update(customerPins)
        .set({ pin })
        .where(eq(customerPins.cnic, cnic));

      return NextResponse.json({ success: true, message: 'PIN updated successfully' }, { status: 200 });
    } else {
      // Agar nahi bana toh Naya insert karein (New PIN)
      const id = 'pin_' + Date.now();
      await db.insert(customerPins).values({
        id,
        userId: userId || 'N/A',
        cnic,
        pin,
      });

      return NextResponse.json({ success: true, message: 'PIN created successfully' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error saving PIN:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}