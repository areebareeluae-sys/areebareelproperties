import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryProfit, inventory, transactionHistory, activityLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Helper function to add 1 month safely
function addOneMonth(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  date.setMonth(date.getMonth() + 1);
  
  if (date.getDate() < day) {
    date.setDate(0);
  }
  return date.toISOString();
}

// 1. GET: Verify CNIC and fetch active assigned data
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cnic = searchParams.get('cnic');

    if (!cnic) {
      return NextResponse.json({ success: false, message: 'CNIC is required' }, { status: 400 });
    }

    const assignments = await db
      .select()
      .from(inventoryProfit)
      .where(
        and(
          eq(inventoryProfit.cnic, cnic),
          eq(inventoryProfit.status, 'Active')
        )
      );

    if (assignments.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No active assigned inventory found for this CNIC.' 
      }, { status: 200 });
    }

    const formattedData = await Promise.all(
      assignments.map(async (item) => {
        const inv = await db
          .select()
          .from(inventory)
          .where(eq(inventory.id, item.inventoryId))
          .limit(1);

        return {
          assignmentId: item.id,
          customerId: item.customerId,
          cnic: item.cnic,
          inventoryId: item.inventoryId,
          inventoryName: inv[0]?.property_title || 'N/A',
          inventoryPrice: item.inventoryPrice || (Number(item.customerUnit) * 100000),
          totalPrice: item.totalPrice, // Original totalPrice unchanged
          customerUnit: item.customerUnit,
          plan: item.plan,
          paymentMethod: item.paymentMethod || 'N/A',
          accountNumber: item.accountNumber || 'N/A',
          accountHolderName: item.accountHolderName || 'N/A',
          profitDate: item.profitDate || item.date || new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({ success: true, assignments: formattedData }, { status: 200 });
  } catch (error) {
    console.error('Verify & Fetch CNIC Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// 2. POST: Handle Upgrade/Downgrade and Profit Settlement
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      assignmentId,
      customerId,
      cnic,
      newUnits,
      accumulatedProfit,
      paymentMethod,
      accountNumber,
      accountHolderName,
      transactionNumber,
      remarks,
      userId 
    } = body;

    if (!assignmentId || !cnic || !transactionNumber || newUnits === undefined || !userId) {
      return NextResponse.json({ success: false, message: 'Required fields are missing!' }, { status: 400 });
    }

    const unitsNum = Number(newUnits);

    // Rule: Units must be between 2 and 20
    if (unitsNum < 2 || unitsNum > 20) {
      return NextResponse.json({ 
        success: false, 
        message: 'Total units must be at least 2 and cannot exceed 20!' 
      }, { status: 400 });
    }

    // Existing assignment fetch karein
    const existingAssignment = await db
      .select()
      .from(inventoryProfit)
      .where(eq(inventoryProfit.id, assignmentId))
      .limit(1);

    if (existingAssignment.length === 0) {
      return NextResponse.json({ success: false, message: 'Assignment not found!' }, { status: 404 });
    }

    const item = existingAssignment[0];
    
    // Yahan sirf inventoryPrice ko units ke mutabiq 100000 se multiply kar ke update karna hai
    const calculatedInventoryPrice = unitsNum * 100000;
    // totalPrice ko bilkul change nahi kiya gaya, wahi rakha gaya hai jo pehle tha (item.totalPrice)

    const currentTimestamp = new Date().toISOString();

    // Transaction History Entry for accumulated profit if > 0
    if (accumulatedProfit && Number(accumulatedProfit) > 0) {
      await db.insert(transactionHistory).values({
        id: crypto.randomUUID(),
        customerId: customerId || item.customerId,
        cnic: cnic,
        officeUserId: userId,
        inventoryId: item.inventoryId,
        plan: 'UPGRADE_PROFIT_SETTLEMENT',
        calculatedAmount: Number(accumulatedProfit),
        transactionNumber: transactionNumber,
        remarks: remarks || 'Profit settlement during unit upgrade/downgrade',
        date: currentTimestamp,
      });
    }

    // Shift profit date by 1 month
    const nextProfitDate = addOneMonth(currentTimestamp);

    // Update inventoryProfit table (customerUnit aur inventoryPrice update hogi, totalPrice ko touch nahi kiya)
    await db
      .update(inventoryProfit)
      .set({ 
        customerUnit: unitsNum,
        inventoryPrice: calculatedInventoryPrice, // Updated inventoryPrice = units * 100,000
        profitDate: nextProfitDate,
        paymentMethod: paymentMethod || item.paymentMethod || 'Bank Transfer',
        accountNumber: accountNumber !== undefined ? accountNumber : item.accountNumber,
        accountHolderName: accountHolderName !== undefined ? accountHolderName : item.accountHolderName
      })
      .where(eq(inventoryProfit.id, assignmentId));

    // Activity Log
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      officeUserId: userId,
      action: 'UPGRADE_ASSIGNED_INVENTORY',
      remarks: `Updated units to ${unitsNum} for CNIC: ${cnic}. New Inventory Price: Rs. ${calculatedInventoryPrice}. Profit settled: Rs. ${accumulatedProfit || 0}.`,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Inventory upgraded and profit settled successfully!',
      inventoryPrice: calculatedInventoryPrice
    }, { status: 200 });

  } catch (error) {
    console.error('Upgrade Inventory Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}