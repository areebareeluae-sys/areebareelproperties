import { NextResponse } from 'next/server';
import { db } from '@/db';
import { formApplications, internalCashLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: Search application by CNIC
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cnic = searchParams.get('cnic');

    if (!cnic) {
      // Agar cnic pass nahi kiya gaya, toh saare internal cash logs return kar dein report ke liye
      const allLogs = await db.select().from(internalCashLogs);
      return NextResponse.json({ success: true, logs: allLogs }, { status: 200 });
    }

    const matchedApplications = await db
      .select()
      .from(formApplications)
      .where(eq(formApplications.cnic, cnic));

    if (matchedApplications.length === 0) {
      return NextResponse.json({ success: false, message: 'No application found with this CNIC' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      applications: matchedApplications 
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// POST: Save internal cash movement log (Cash In / Cash Send)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      cnic, 
      customerName, 
      agentId, 
      agentName, 
      transactionType,
      receivedFrom, 
      givenTo, 
      amount, 
      slipOrRefNumber, 
      internalRemarks 
    } = body;

    if (!cnic || amount === undefined || !transactionType || !receivedFrom || !givenTo || !agentId) {
      return NextResponse.json({ success: false, message: 'Required fields are missing!' }, { status: 400 });
    }

    await db.insert(internalCashLogs).values({
      id: crypto.randomUUID(),
      cnic,
      customerName: customerName || 'N/A',
      agentId,
      agentName: agentName || 'Admin/Agent',
      transactionType,
      receivedFrom,
      givenTo,
      amount: String(amount),
      slipOrRefNumber: slipOrRefNumber || 'N/A',
      internalRemarks: internalRemarks || 'Internal Cash Movement Record',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Internal cash record saved successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Internal Cash Save Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
// GET: Search application by CNIC or fetch all logs for reports
