import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventory, formApplications, inventoryProfit, activityLogs } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

// Helper function to safely add 1 month handling month-end bounds (e.g., Jan 31 -> Feb 28/29)
function addOneMonth(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  date.setMonth(date.getMonth() + 1);
  
  // Check if month overflowed because of days difference (e.g., Jan 31 + 1 month = Mar 3)
  if (date.getDate() < day) {
    // Set to the last day of the previous month
    date.setDate(0);
  }
  return date.toISOString();
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

// --- POST: Verify CNIC & Assign Property ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      inventoryId, 
      cnic, 
      customerUnit, 
      plan, 
      paymentMethod, 
      accountNumber, 
      accountHolderName, 
      actorId,
      customerId // Agar frontend se customerId aa rahi hai
    } = body;

    if (!inventoryId || !cnic || !customerUnit || !plan || !paymentMethod) {
      return NextResponse.json({ success: false, message: 'All required fields including plan must be filled!' }, { status: 400 });
    }

    const requestedUnits = Number(customerUnit);

    if (requestedUnits < 2 || requestedUnits > 20) {
      return NextResponse.json({ success: false, message: 'You can assign minimum 2 and maximum 20 units only!' }, { status: 400 });
    }

    // 2. Fetch Inventory Record
    const invRecord = await db.select().from(inventory).where(eq(inventory.id, inventoryId)).limit(1);
    if (invRecord.length === 0) {
      return NextResponse.json({ success: false, message: 'Inventory item not found!' }, { status: 404 });
    }

    const invItem = invRecord[0];
    const calculatedTotalUnits = Math.floor(Number(invItem.price) / 100000);
    const totalUnit = calculatedTotalUnits > 0 ? calculatedTotalUnits : 1;

    // 3. Check already assigned units
    const assignedResult = await db
      .select({ totalAssigned: sql<number>`sum(customer_unit)` })
      .from(inventoryProfit)
      .where(eq(inventoryProfit.inventoryId, inventoryId));

    const assignedUnit = assignedResult[0]?.totalAssigned || 0;
    const pendingUnit = Math.max(0, totalUnit - assignedUnit);

    if (requestedUnits > pendingUnit) {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot assign! Only ${pendingUnit} units are remaining for this inventory.` 
      }, { status: 400 });
    }

    const unitPrice = 100000; 
    const calculatedInventoryPrice = unitPrice * requestedUnits;
    const inventoryTotalPrice = Number(invItem.price); 

    const profitId = crypto.randomUUID();
    const currentDate = new Date().toISOString();
    
    // By default profitDate ko exactly 1 month aage set kar diya gaya hai
    const initialProfitDate = addOneMonth(currentDate);

    // 4. Insert into inventory_profit table
    await db.insert(inventoryProfit).values({
      id: profitId,
      customerId: cnic || '', 
      cnic: cnic,
      inventoryId: inventoryId, // Fixed field reference
      inventoryPrice: calculatedInventoryPrice,
      totalPrice: inventoryTotalPrice, 
      customerUnit: requestedUnits,
      plan: plan,
      paymentMethod: paymentMethod,
      accountNumber: accountNumber || '',
      accountHolderName: accountHolderName || '',
      date: currentDate,
      profitDate: initialProfitDate, // <-- Ab yeh by default next month ki date se save hoga
    });

    // 5. Log the Activity
    if (actorId) {
      await db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        officeUserId: actorId,
        action: 'ASSIGN_INVENTORY_PROPERTY',
        remarks: `Assigned ${requestedUnits} units under plan (${plan}) for inventory (${invItem.property_title}) with Total Price: ${inventoryTotalPrice} to CNIC: ${cnic}`,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Property assigned successfully!'
    }, { status: 201 });

  } catch (error) {
    console.error('Assign Property Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}