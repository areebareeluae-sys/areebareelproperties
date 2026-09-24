import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryProfit, formApplications, transactionHistory, inventory, activityLogs, pendingAmmount, customerPaymentMethods } from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';

function addOneMonth(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  date.setMonth(date.getMonth() + 1);
  
  if (date.getDate() < day) {
    date.setDate(0);
  }
  return date.toISOString();
}

export async function GET(req: Request) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Fetch Active Inventory Profits (where date <= today)
    const assignments = await db
      .select()
      .from(inventoryProfit)
      .where(eq(inventoryProfit.status, 'Active'));

    const filteredAssignments = assignments.filter((item) => {
      const profitDateStr = item.profitDate ? item.profitDate.split('T')[0] : item.date.split('T')[0];
      return profitDateStr <= todayStr;
    });

    const inventoryTransfers = [];
    for (const item of filteredAssignments) {
      const payMethodRecord = await db
        .select()
        .from(customerPaymentMethods)
        .where(eq(customerPaymentMethods.cnic, item.cnic))
        .limit(1);

      if (payMethodRecord.length === 0) continue; // Skip if payment method is not added

      const itemProfitDate = item.profitDate ? new Date(item.profitDate) : new Date(item.date);

      const customer = await db
        .select()
        .from(formApplications)
        .where(eq(formApplications.id, item.customerId))
        .limit(1);

      const inv = await db
        .select()
        .from(inventory)
        .where(eq(inventory.id, item.inventoryId))
        .limit(1);

      const units = Number(item.customerUnit) || 0;
      let finalCalculatedAmount = 0;
      const planName = (item.plan || '').trim();

      if (planName.toLowerCase().includes('dual_benefit') || planName.toLowerCase().includes('dual benefit')) {
        finalCalculatedAmount = units * 2200;
      } else if (planName.toLowerCase().includes('capital_gain') || planName.toLowerCase().includes('capital gain')) {
        finalCalculatedAmount = units * 800;
      } else {
        const annualRate = 0.08;
        finalCalculatedAmount = (Number(item.inventoryPrice) * annualRate) / 12;
      }

      inventoryTransfers.push({
        id: item.id,
        type: 'inventory',
        customerId: item.customerId,
        cnic: item.cnic,
        customerPhone: customer[0]?.mobile || 'N/A',
        inventoryName: inv[0]?.property_title || 'N/A',
        inventoryId: item.inventoryId,
        inventoryPrice: item.inventoryPrice,
        totalPrice: item.totalPrice || inv[0]?.price || 0,
        customerUnit: units,
        plan: item.plan,
        profitDate: itemProfitDate.toISOString(),
        calculatedAmount: Math.round(finalCalculatedAmount),
        paymentMethod: payMethodRecord[0].bankName,
        accountNumber: payMethodRecord[0].accountNumber,
        accountHolderName: payMethodRecord[0].accountHolder,
      });
    }

    // 2. Fetch Pending Amounts from pendingAmmount table where status is 'pending' and profitdate <= today
    const pendingRecords = await db
      .select()
      .from(pendingAmmount)
      .where(eq(pendingAmmount.status, 'pending'));

    const filteredPendingRecords = pendingRecords.filter((p) => {
      const pDateStr = p.profitdate ? p.profitdate.split('T')[0] : '';
      return pDateStr !== '' && pDateStr <= todayStr;
    });

    const formattedPending = [];
    for (const p of filteredPendingRecords) {
      const payMethodRecord = await db
        .select()
        .from(customerPaymentMethods)
        .where(eq(customerPaymentMethods.cnic, p.cnic))
        .limit(1);

      if (payMethodRecord.length === 0) continue; // Skip if payment method is not added

      const customer = await db
        .select()
        .from(formApplications)
        .where(eq(formApplications.cnic, p.cnic))
        .limit(1);

      let extractedPlan = 'Pending-Plan';
      if (p.reson && p.reson.includes('under plan')) {
        const match = p.reson.match(/under plan \((.*?)\)/);
        if (match && match[1]) {
          extractedPlan = match[1];
        }
      }

      formattedPending.push({
        id: p.id,
        type: 'pending_amount',
        customerId: customer[0]?.id || 'N/A',
        cnic: p.cnic,
        customerPhone: customer[0]?.mobile || 'N/A',
        inventoryName: p.reson,
        inventoryId: 'N/A',
        inventoryPrice: 0,
        totalPrice: 0,
        customerUnit: 0,
        plan: extractedPlan,
        profitDate: p.profitdate,
        calculatedAmount: Math.round(p.ammount),
        paymentMethod: payMethodRecord[0].bankName,
        accountNumber: payMethodRecord[0].accountNumber,
        accountHolderName: payMethodRecord[0].accountHolder,
      });
    }

    const combinedData = [...inventoryTransfers, ...formattedPending];

    return NextResponse.json({ success: true, transfers: combinedData }, { status: 200 });
  } catch (error) {
    console.error('Fetch Transfer Data Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      id, 
      type,
      customerId, 
      cnic, 
      inventoryId, 
      plan, 
      calculatedAmount, 
      transactionNumber, 
      remarks, 
      userId 
    } = body;

    if (!id || !cnic || !transactionNumber || !calculatedAmount || !userId) {
      return NextResponse.json({ success: false, message: 'All required fields must be filled!' }, { status: 400 });
    }

    const transferId = crypto.randomUUID();
    const currentTimestamp = new Date().toISOString();
    const todayDateStr = new Date().toISOString().split('T')[0];

    const finalRemarks = `Txn ID: ${transactionNumber} | Notes: ${remarks || 'No remarks'} | Sent via Cash Transfer System`;

    // Add record to transactionHistory table
    await db.insert(transactionHistory).values({
      id: transferId,
      customerId: customerId || 'N/A',
      cnic: cnic,
      officeUserId: userId,
      inventoryId: inventoryId || 'N/A',
      plan: plan || 'N/A',
      calculatedAmount: Number(calculatedAmount),
      transactionNumber: transactionNumber,
      remarks: finalRemarks,
      date: currentTimestamp,
    });

    if (type === 'pending_amount') {
      // Update pendingAmmount status to 'Send', set sendData and remarks to current date/info
      await db
        .update(pendingAmmount)
        .set({ 
          status: 'Send', 
          sendData: todayDateStr,
          remarks: finalRemarks 
        })
        .where(eq(pendingAmmount.id, id));
    } else {
      const currentAssignment = await db
        .select()
        .from(inventoryProfit)
        .where(eq(inventoryProfit.id, id))
        .limit(1);

      if (currentAssignment.length > 0) {
        const baseDateForShift = currentAssignment[0].profitDate || currentAssignment[0].date;
        const nextProfitDate = addOneMonth(baseDateForShift);

        await db
          .update(inventoryProfit)
          .set({ profitDate: nextProfitDate })
          .where(eq(inventoryProfit.id, id));
      }
    }

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      officeUserId: userId,
      action: 'CASH_TRANSFER_PROFIT',
      remarks: `Transferred Rs. ${calculatedAmount} under plan (${plan}) to CNIC: ${cnic}. Txn: ${transactionNumber}.`,
    });

    return NextResponse.json({ success: true, message: 'Cash transferred successfully and records updated!' }, { status: 201 });
  } catch (error) {
    console.error('Cash Transfer Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}