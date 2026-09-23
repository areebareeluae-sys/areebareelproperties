import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryProfit, formApplications, transactionHistory, inventory, activityLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Helper function to safely add 1 month handling month-end bounds
function addOneMonth(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  date.setMonth(date.getMonth() + 1);
  
  if (date.getDate() < day) {
    date.setDate(0);
  }
  return date.toISOString();
}

// --- GET: Fetch Active & Due/Today Inventories ---
export async function GET(req: Request) {
  try {
    // Aaj ki date ki YYYY-MM-DD string (e.g., "2026-09-18")
    const todayStr = new Date().toISOString().split('T')[0];

    // Status 'Active' wale sare records utha lein
    const assignments = await db
      .select()
      .from(inventoryProfit)
      .where(eq(inventoryProfit.status, 'Active'));

    // JavaScript side par filter taake date comparison 100% accurate ho
    const filteredAssignments = assignments.filter((item) => {
      const profitDateStr = item.profitDate ? item.profitDate.split('T')[0] : item.date.split('T')[0];
      // Agar profit date aaj ki ya aaj se pehle ki (due) hai, toh show ho
      return profitDateStr <= todayStr;
    });

    const formattedData = await Promise.all(
      filteredAssignments.map(async (item) => {
        const itemProfitDate = item.profitDate ? new Date(item.profitDate) : new Date(item.date);

        // Fetch customer info
        const customer = await db
          .select()
          .from(formApplications)
          .where(eq(formApplications.id, item.customerId))
          .limit(1);

        // Fetch inventory title
        const inv = await db
          .select()
          .from(inventory)
          .where(eq(inventory.id, item.inventoryId))
          .limit(1);

        // Calculation based on plan
        const annualRate = 0.08;
        const monthlyBase = (Number(item.inventoryPrice) * annualRate) / 12;

        let finalCalculatedAmount = monthlyBase;
        if (item.plan && item.plan.toLowerCase().includes('gold8*f')) {
          finalCalculatedAmount += 1400; 
        }

        return {
          assignmentId: item.id,
          customerId: item.customerId,
          cnic: item.cnic,
          customerPhone: customer[0]?.mobile || 'N/A',
          inventoryName: inv[0]?.property_title || 'N/A',
          inventoryId: item.inventoryId,
          inventoryPrice: item.inventoryPrice,
          totalPrice: item.totalPrice || inv[0]?.price || 0,
          customerUnit: item.customerUnit,
          plan: item.plan,
          paymentMethod: item.paymentMethod || 'N/A',
          accountNumber: item.accountNumber || 'N/A',
          accountHolderName: item.accountHolderName || 'N/A',
          profitDate: itemProfitDate.toISOString(),
          calculatedAmount: Math.round(finalCalculatedAmount),
        };
      })
    );

    return NextResponse.json({ success: true, transfers: formattedData }, { status: 200 });
  } catch (error) {
    console.error('Fetch Transfer Data Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// --- POST: Save Cash Transfer & Shift Profit Date by 1 Month ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      assignmentId,
      customerId, 
      cnic, 
      inventoryId, 
      plan, 
      calculatedAmount, 
      transactionNumber, 
      remarks, 
      userId 
    } = body;

    if (!assignmentId || !customerId || !cnic || !transactionNumber || !calculatedAmount || !userId) {
      return NextResponse.json({ success: false, message: 'All required fields must be filled!' }, { status: 400 });
    }

    const transferId = crypto.randomUUID();
    const currentTimestamp = new Date().toISOString();

    // 1. Insert into transaction_history table
    await db.insert(transactionHistory).values({
      id: transferId,
      customerId: customerId,
      cnic: cnic,
      officeUserId: userId,
      inventoryId: inventoryId,
      plan: plan,
      calculatedAmount: Number(calculatedAmount),
      transactionNumber: transactionNumber,
      remarks: remarks || 'No remarks',
      date: currentTimestamp,
    });

    // 2. Fetch current assignment record to get its existing profitDate
    const currentAssignment = await db
      .select()
      .from(inventoryProfit)
      .where(eq(inventoryProfit.id, assignmentId))
      .limit(1);

    if (currentAssignment.length > 0) {
      const baseDateForShift = currentAssignment[0].profitDate || currentAssignment[0].date;
      const nextProfitDate = addOneMonth(baseDateForShift);

      // 3. Update inventory_profit table: shift profitDate to next month
      await db
        .update(inventoryProfit)
        .set({ profitDate: nextProfitDate })
        .where(eq(inventoryProfit.id, assignmentId));
    }

    // 4. Create Activity Log
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      officeUserId: userId,
      action: 'CASH_TRANSFER_PROFIT',
      remarks: `Transferred Rs. ${calculatedAmount} under plan (${plan}) to CNIC: ${cnic}. Txn: ${transactionNumber}. Next profit date shifted.`,
    });

    return NextResponse.json({ success: true, message: 'Cash transferred and profit date shifted successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Cash Transfer Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}