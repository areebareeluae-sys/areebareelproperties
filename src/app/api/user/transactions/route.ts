import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryProfit, transactionHistory, formApplications, inventory } from '@/db/schema';
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

    // 1. Fetch Form Application Details
    const applicationData = await db
      .select()
      .from(formApplications)
      .where(eq(formApplications.cnic, cnic));

    // 2. Fetch Inventory & Plan Details with Property Name
    const inventoryDataRaw = await db
      .select()
      .from(inventoryProfit)
      .where(eq(inventoryProfit.cnic, cnic));

    const inventoryDetails = [];
    for (const item of inventoryDataRaw) {
      const inv = await db
        .select()
        .from(inventory)
        .where(eq(inventory.id, item.inventoryId))
        .limit(1);

      inventoryDetails.push({
        ...item,
        propertyTitle: inv[0]?.property_title || 'N/A',
        location: inv[0]?.location || 'N/A',
        category: inv[0]?.category || 'N/A',
      });
    }

    // 3. Fetch Transaction History with Property Name
    const transactionsRaw = await db
      .select()
      .from(transactionHistory)
      .where(eq(transactionHistory.cnic, cnic));

    const transactions = [];
    for (const tx of transactionsRaw) {
      let propertyTitle = 'N/A';
      if (tx.inventoryId && tx.inventoryId !== 'N/A') {
        const inv = await db
          .select()
          .from(inventory)
          .where(eq(inventory.id, tx.inventoryId))
          .limit(1);
        if (inv.length > 0) {
          propertyTitle = inv[0].property_title;
        }
      }

      transactions.push({
        ...tx,
        propertyTitle,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          applicationDetails: applicationData,
          inventoryDetails: inventoryDetails,
          transactions: transactions,
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