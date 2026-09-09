import { NextResponse } from 'next/server';
import { db } from '@/db'; // Apne database connection ka path check kar lein
import { properties } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.userId, userId));

    return NextResponse.json({ success: true, data: userProperties }, { status: 200 });
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}