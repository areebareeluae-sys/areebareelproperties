import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryProfit, transactionHistory, formApplications } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cnic = searchParams.get('cnic');

    if (!cnic) {
      return NextResponse.json(
        { success: false, message: 'CNIC is required' },
        { status: 400 }
      );
    }

    // 1. Fetch Form Application Details (Applicant info)
    const applicationData = await db
      .select()
      .from(formApplications)
      .where(eq(formApplications.cnic, cnic));

    // 2. Fetch Inventory & Payment Details
    const inventoryData = await db
      .select()
      .from(inventoryProfit)
      .where(eq(inventoryProfit.cnic, cnic));

    // 3. Fetch Transaction History
    const transactions = await db
      .select()
      .from(transactionHistory)
      .where(eq(transactionHistory.cnic, cnic));

    return NextResponse.json(
      {
        success: true,
        data: {
          applicationDetails: applicationData, // form_applications ka data
          inventoryDetails: inventoryData,     // inventory_profit ka data
          transactions: transactions,          // transaction_history ka data
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    );
  }
}