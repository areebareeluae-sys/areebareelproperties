import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventory, inventoryProfit, activityLogs, pendingAmmount } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

// Helper to get exactly 1 month backward (to find the start of the current running cycle)
function getPreviousMonthSameDate(dateString: string): string {
  const date = new Date(dateString);
  const originalDay = date.getDate();

  date.setMonth(date.getMonth() - 1);

  const dateCheck = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const lastDayOfTargetMonth = dateCheck.getDate();
  const targetDay = originalDay <= lastDayOfTargetMonth ? originalDay : lastDayOfTargetMonth;

  const finalDate = new Date(date.getFullYear(), date.getMonth(), targetDay, 
    new Date(dateString).getHours(), 
    new Date(dateString).getMinutes(), 
    new Date(dateString).getSeconds(), 
    new Date(dateString).getMilliseconds()
  );

  return finalDate.toISOString();
}

// Helper to get next month same date based on TODAY (Handles 28, 29, 30, 31 days safe)
function getNextMonthSameDateFromToday(): string {
  const date = new Date(); // Today's date
  const originalDay = date.getDate();

  date.setMonth(date.getMonth() + 1);

  const dateCheck = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const lastDayOfTargetMonth = dateCheck.getDate();
  const targetDay = originalDay <= lastDayOfTargetMonth ? originalDay : lastDayOfTargetMonth;

  const finalDate = new Date(date.getFullYear(), date.getMonth(), targetDay, 
    new Date().getHours(), 
    new Date().getMinutes(), 
    new Date().getSeconds(), 
    new Date().getMilliseconds()
  );

  return finalDate.toISOString();
}

// --- GET: Fetch Inventory Summary List ---
export async function GET(req: Request) {
  try {
    const allInventories = await db.select().from(inventory);
    
    const inventoryData = await Promise.all(
      allInventories.map(async (inv) => {
        const calculatedTotalUnits = Math.floor(Number(inv.price) / 100000);

        const assignedResult = await db
          .select({ totalAssigned: sql<number>`sum(customer_unit)` })
          .from(inventoryProfit)
          .where(eq(inventoryProfit.inventoryId, inv.id));

        const assignedUnit = assignedResult[0]?.totalAssigned || 0;
        const totalUnit = calculatedTotalUnits > 0 ? calculatedTotalUnits : 1;
        const pendingUnit = Math.max(0, totalUnit - assignedUnit);

        return {
          id: inv.id,
          inventoryName: inv.property_title,
          totalPrice: inv.price, 
          totalUnit: totalUnit,
          assignedUnit: assignedUnit,
          pendingUnit: pendingUnit,
          unitPrice: 100000 
        };
      })
    );

    return NextResponse.json({ success: true, inventories: inventoryData }, { status: 200 });
  } catch (error) {
    console.error('Fetch Inventory Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// --- POST: Assign Property & Handle Upgrade Prorated Pending Amount & Shift Profit Date to Today's Next Month ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      inventoryId, 
      cnic, 
      customerUnit, 
      plan, 
      actorId 
    } = body;

    if (!inventoryId || !cnic || !customerUnit || !plan) {
      return NextResponse.json({ success: false, message: 'All required fields including plan must be filled!' }, { status: 400 });
    }

    const requestedUnits = Number(customerUnit);

    if (requestedUnits < 2 || requestedUnits > 20) {
      return NextResponse.json({ success: false, message: 'You can assign minimum 2 and maximum 20 units at a time!' }, { status: 400 });
    }

    // 1. Check if exact same plaza and plan already exists for this CNIC
    const existingSameRow = await db
      .select()
      .from(inventoryProfit)
      .where(
        and(
          eq(inventoryProfit.cnic, cnic),
          eq(inventoryProfit.inventoryId, inventoryId),
          eq(inventoryProfit.plan, plan)
        )
      )
      .limit(1);

    const existingUnitsInThisSpecificRow = existingSameRow.length > 0 ? existingSameRow[0].customerUnit : 0;

    // 2. Check total units assigned across all properties
    const userExistingAssignments = await db
      .select({ totalUnits: sql<number>`sum(customer_unit)` })
      .from(inventoryProfit)
      .where(eq(inventoryProfit.cnic, cnic));

    const currentAssignedTotal = userExistingAssignments[0]?.totalUnits || 0;
    const prospectiveTotal = currentAssignedTotal - existingUnitsInThisSpecificRow + requestedUnits;

    if (prospectiveTotal > 20) {
      return NextResponse.json({ 
        success: false, 
        message: `Assignment failed! Total units per CNIC cannot exceed 20 (Your total would be ${prospectiveTotal}).` 
      }, { status: 400 });
    }

    // 3. Fetch Inventory Record
    const invRecord = await db.select().from(inventory).where(eq(inventory.id, inventoryId)).limit(1);
    if (invRecord.length === 0) {
      return NextResponse.json({ success: false, message: 'Inventory item not found!' }, { status: 404 });
    }

    const invItem = invRecord[0];
    const calculatedTotalUnits = Math.floor(Number(invItem.price) / 100000);
    const totalUnit = calculatedTotalUnits > 0 ? calculatedTotalUnits : 1;

    const assignedResult = await db
      .select({ totalAssigned: sql<number>`sum(customer_unit)` })
      .from(inventoryProfit)
      .where(eq(inventoryProfit.inventoryId, inventoryId));

    const assignedResultTotal = assignedResult[0]?.totalAssigned || 0;
    const pendingUnit = Math.max(0, totalUnit - (assignedResultTotal - existingUnitsInThisSpecificRow));

    if (requestedUnits > pendingUnit) {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot assign! Only ${pendingUnit} units are remaining for this inventory.` 
      }, { status: 400 });
    }

    const unitPrice = 100000; 
    const inventoryTotalPrice = Number(invItem.price); 

    if (existingSameRow.length > 0) {
      // --- CASE 1: SAME PLAZA & SAME PLAN -> UPGRADE EXISTING ROW ---
      const currentRecord = existingSameRow[0];
      const previousUnits = currentRecord.customerUnit;
      const updatedCustomerUnits = previousUnits + requestedUnits; 
      const updatedInventoryPrice = unitPrice * updatedCustomerUnits;
      const oldProfitDateStr = currentRecord.profitDate;

      // New profit date will be shifted to next month based on TODAY's date
      const newProfitDate = getNextMonthSameDateFromToday();

      // Update inventoryProfit record
      await db
        .update(inventoryProfit)
        .set({
          customerUnit: updatedCustomerUnits,
          inventoryPrice: updatedInventoryPrice,
          profitDate: newProfitDate, 
        })
        .where(eq(inventoryProfit.id, currentRecord.id));

      // --- Calculate Prorated Pending Amount from Current Cycle Start to Today ---
      const profitRatePerUnit = plan === 'Dual_Benefit' ? 2200 : (plan === 'Capital_Gain' ? 800 : 0);

      if (profitRatePerUnit > 0 && oldProfitDateStr) {
        const cycleStartDateStr = getPreviousMonthSameDate(oldProfitDateStr);
        const cycleStartDateObj = new Date(cycleStartDateStr);
        const todayObj = new Date();

        const diffTime = todayObj.getTime() - cycleStartDateObj.getTime();
        let elapsedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (elapsedDays < 0) elapsedDays = 0;

        const calculatedPendingAmount = (profitRatePerUnit / 30) * requestedUnits * elapsedDays;

        // Insert into PendingAmmount table with property information included in reason
        await db.insert(pendingAmmount).values({
          id: crypto.randomUUID(),
          cnic: cnic,
          ammount: Math.round(calculatedPendingAmount),
          profitdate: oldProfitDateStr,
          reson: `Upgraded units from ${previousUnits} to ${updatedCustomerUnits} for property (${invItem.property_title}) under plan (${plan})`,
          status: 'pending',
          remarks: '',
          sendData: null
        });
      }

      if (actorId) {
        await db.insert(activityLogs).values({
          id: crypto.randomUUID(),
          officeUserId: actorId,
          action: 'UPDATE_INVENTORY_UNITS',
          remarks: `Added ${requestedUnits} more units under plan (${plan}) for property (${invItem.property_title}) for CNIC: ${cnic}. Total units now: ${updatedCustomerUnits}. Profit date shifted to today's next month.`,
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Existing property units upgraded, pending amount calculated, and profit date shifted successfully!'
      }, { status: 200 });

    } else {
      // --- CASE 2: DIFFERENT PLAZA OR DIFFERENT PLAN -> CREATE NEW ROW ---
      const profitId = crypto.randomUUID();
      const currentDate = new Date().toISOString();
      const initialProfitDate = getNextMonthSameDateFromToday();
      const calculatedInventoryPrice = unitPrice * requestedUnits;

      await db.insert(inventoryProfit).values({
        id: profitId,
        customerId: cnic, 
        cnic: cnic,
        inventoryId: inventoryId,
        inventoryPrice: calculatedInventoryPrice,
        totalPrice: inventoryTotalPrice, 
        customerUnit: requestedUnits,
        plan: plan,
        date: currentDate,
        profitDate: initialProfitDate,
      });

      if (actorId) {
        await db.insert(activityLogs).values({
          id: crypto.randomUUID(),
          officeUserId: actorId,
          action: 'ASSIGN_INVENTORY_PROPERTY',
          remarks: `Assigned new ${requestedUnits} units under plan (${plan}) for property (${invItem.property_title}) to CNIC: ${cnic}`,
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Property assigned successfully!'
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Assign Property Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}