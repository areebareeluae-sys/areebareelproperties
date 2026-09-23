import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryProfit, inventory, activityLogs } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

// 1. GET: Fetch active customer assignment by CNIC OR fetch all available inventories list
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cnic = searchParams.get('cnic');
    const fetchInventories = searchParams.get('fetchInventories');

    // Action A: Fetch all inventories with unit calculations (considering only Active inventoryProfit records)
    if (fetchInventories === 'true') {
      const allInventories = await db.select().from(inventory);

      const formattedInventories = await Promise.all(
        allInventories.map(async (inv: any) => {
          // Sirf 'Active' status wale assigned units ka sum nikala jaye ga
          const assignedResult = await db
            .select({
              totalAssigned: sql<number>`COALESCE(SUM(${inventoryProfit.customerUnit}), 0)`
            })
            .from(inventoryProfit)
            .where(
              and(
                eq(inventoryProfit.inventoryId, inv.id),
                eq(inventoryProfit.status, 'Active')
              )
            );

          const assignedUnits = Number(assignedResult[0]?.totalAssigned || 0);
          
          // Price ko 100,000 se divide kar ke total units nikal liye
          const propertyPrice = Number(inv.price || 0);
          const totalUnits = propertyPrice > 0 ? Math.round(propertyPrice / 100000) : 100;
          
          // Available units calculation
          const remainingUnits = Math.max(0, totalUnits - assignedUnits);

          return {
            id: inv.id,
            property_title: inv.property_title || 'Untitled Property',
            totalUnits: totalUnits,
            remainingUnits: remainingUnits,
            inventoryPrice: propertyPrice, 
            totalPrice: propertyPrice,
          };
        })
      );

      return NextResponse.json({ success: true, inventories: formattedInventories }, { status: 200 });
    }

    // Action B: Fetch customer assignment details by CNIC (where status is 'Active')
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
      )
      .limit(1);

    if (assignments.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No active assignment found for this CNIC.' 
      }, { status: 200 });
    }

    const item = assignments[0];
    const inv = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, item.inventoryId))
      .limit(1);

    const assignmentData = {
      assignmentId: item.id,
      customerId: item.customerId,
      cnic: item.cnic,
      inventoryId: item.inventoryId,
      inventoryName: inv[0]?.property_title || 'N/A',
      customerUnit: item.customerUnit,
      inventoryPrice: item.inventoryPrice,
      totalPrice: item.totalPrice,
      plan: item.plan,
      paymentMethod: item.paymentMethod,
    };

    return NextResponse.json({ success: true, assignment: assignmentData }, { status: 200 });
  } catch (error) {
    console.error('Fetch Transfer Assignment Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// 2. POST: Execute inventory shift & update totalPrice
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assignmentId, newInventoryId, newTotalPrice, userId, remarks } = body;

    if (!assignmentId || !newInventoryId || newTotalPrice === undefined || !userId) {
      return NextResponse.json({ success: false, message: 'Missing required fields!' }, { status: 400 });
    }

    // A. Get current assignment record
    const currentAssignment = await db
      .select()
      .from(inventoryProfit)
      .where(eq(inventoryProfit.id, assignmentId))
      .limit(1);

    if (currentAssignment.length === 0) {
      return NextResponse.json({ success: false, message: 'Assignment record not found!' }, { status: 404 });
    }

    const requiredUnits = Number(currentAssignment[0].customerUnit || 0);

    // B. Verify target inventory exists and check remaining active units
    const targetInv = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, newInventoryId))
      .limit(1);

    if (targetInv.length === 0) {
      return NextResponse.json({ success: false, message: 'Target inventory not found!' }, { status: 404 });
    }

    const assignedResult = await db
      .select({
        totalAssigned: sql<number>`COALESCE(SUM(${inventoryProfit.customerUnit}), 0)`
      })
      .from(inventoryProfit)
      .where(
        and(
          eq(inventoryProfit.inventoryId, newInventoryId),
          eq(inventoryProfit.status, 'Active')
        )
      );

    const totalAssigned = Number(assignedResult[0]?.totalAssigned || 0);
    const targetPrice = Number(targetInv[0].price || 0);
    const totalUnitsInTarget = targetPrice > 0 ? Math.round(targetPrice / 100000) : 100;
    const availableUnits = totalUnitsInTarget - totalAssigned;

    if (requiredUnits > availableUnits) {
      return NextResponse.json({
        success: false,
        message: `Target inventory does not have enough units available! Required: ${requiredUnits}, Available: ${availableUnits}`
      }, { status: 400 });
    }

    // C. Update inventoryId and totalPrice
    await db
      .update(inventoryProfit)
      .set({
        inventoryId: newInventoryId,
        totalPrice: Number(newTotalPrice), 
      })
      .where(eq(inventoryProfit.id, assignmentId));

    // D. Create Activity Log entry
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      officeUserId: userId,
      action: 'SHIFT_CUSTOMER_INVENTORY',
      remarks: remarks || `Shifted customer (CNIC: ${currentAssignment[0].cnic}) to new inventory ID: ${newInventoryId}`,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Customer successfully shifted and activity logged!' 
    }, { status: 200 });

  } catch (error) {
    console.error('Shift Inventory Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}