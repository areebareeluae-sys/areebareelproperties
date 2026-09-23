import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryProfit, transactionHistory } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cnic = searchParams.get('cnic');

    if (!cnic) {
      return NextResponse.json(
        { success: false, message: 'CNIC parameter is required.' },
        { status: 400 }
      );
    }

    // 1. Inventory Profit table se data fetch karein
    const profitData = await db
      .select()
      .from(inventoryProfit)
      .where(eq(inventoryProfit.cnic, cnic));

    // 2. Transaction History table se data fetch karein
    const transactionData = await db
      .select()
      .from(transactionHistory)
      .where(eq(transactionHistory.cnic, cnic));

    return NextResponse.json(
      {
        success: true,
        data: {
          inventoryProfits: profitData,
          transactions: transactionData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch Transaction History Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transaction history.' },
      { status: 500 }
    );
  }
}