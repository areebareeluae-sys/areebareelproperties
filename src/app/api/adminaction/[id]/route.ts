import { NextResponse } from 'next/server';
import { db } from '@/db';
import { formApplications } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const appId = params.id;

    console.log("Fetching Application ID in adminaction:", appId); // Ab yeh terminal console mein zaroor nazar aayega!

    if (!appId) {
      return NextResponse.json(
        { success: false, message: 'Application ID missing hai.' },
        { status: 400 }
      );
    }

    const [application] = await db
      .select()
      .from(formApplications)
      .where(eq(formApplications.id, appId));

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application nahi mili.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Error fetching application detail:', error);
    return NextResponse.json(
      { success: false, message: 'Server error aa gaya hai.' },
      { status: 500 }
    );
  }
}