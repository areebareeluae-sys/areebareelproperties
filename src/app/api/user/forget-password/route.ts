import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, customerPins } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { identifier, pin, newPassword, action } = await req.json();

    if (!identifier) {
      return NextResponse.json({ success: false, message: 'CNIC is required' }, { status: 400 });
    }

    // User ko CNIC se talaash karein
    const user = await db
      .select()
      .from(users)
      .where(eq(users.cnic, identifier))
      .get();

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found with this CNIC' }, { status: 404 });
    }

    if (action === 'verify-pin') {
      if (!pin) {
        return NextResponse.json({ success: false, message: 'PIN is required' }, { status: 400 });
      }

      // customerPins table se CNIC ya userId ke zariye pin record fetch karein
      const pinRecord = await db
        .select()
        .from(customerPins)
        .where(eq(customerPins.cnic, identifier))
        .get();

      // Agar pin record nahi milta toh message dein: Pin not generated
      if (!pinRecord) {
        return NextResponse.json({ success: false, message: 'Pin not generated' }, { status: 404 });
      }

      // Agar PIN match nahi hota
      if (pinRecord.pin !== pin) {
        return NextResponse.json({ success: false, message: 'Invalid PIN' }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'PIN verified successfully' }, { status: 200 });
    } 
    
    if (action === 'reset-password') {
      // Step 2: Update Password
      if (!newPassword) {
        return NextResponse.json({ success: false, message: 'New password is required' }, { status: 400 });
      }

      await db
        .update(users)
        .set({ password: newPassword })
        .where(eq(users.id, user.id));

      return NextResponse.json({ success: true, message: 'Password reset successfully' }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in forget password:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}