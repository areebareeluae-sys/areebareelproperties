import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryProfit, inventory, activityLogs, customerPins } from '@/db/schema';
import { eq, and, sql, not } from 'drizzle-orm';

// 1. GET: Fetch list of inventories or active assignments by CNIC
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cnic = searchParams.get('cnic');
    const fetchInventories = searchParams.get('fetchInventories');

    if (fetchInventories === 'true') {
      const allInventories = await db.select().from(inventory);

      const formattedInventories = await Promise.all(
        allInventories.map(async (inv: any) => {
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
          const propertyPrice = Number(inv.price || 0);
          const totalUnits = propertyPrice > 0 ? Math.round(propertyPrice / 100000) : 100;
          const remainingUnits = Math.max(0, totalUnits - assignedUnits);

          return {
            id: inv.id,
            property_title: inv.property_title || 'Untitled Property',
            totalUnits: totalUnits,
            remainingUnits: remainingUnits,
            price: propertyPrice,
          };
        })
      );

      return NextResponse.json({ success: true, inventories: formattedInventories }, { status: 200 });
    }

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
        message: 'No active assignments found for this CNIC.' 
      }, { status: 200 });
    }

    const formattedAssignments = await Promise.all(
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
          customerUnit: item.customerUnit,
          inventoryPrice: item.inventoryPrice,
          totalPrice: item.totalPrice,
          plan: item.plan,
        };
      })
    );

    return NextResponse.json({ success: true, assignments: formattedAssignments }, { status: 200 });
  } catch (error) {
    console.error('Fetch Transfer Assignment Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// 2. POST: Execute partial or full unit transfer with merging & auto-deletion of empty rows
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assignmentId, newInventoryId, transferUnits, pin, userId, remarks } = body;

    if (!assignmentId || !newInventoryId || !transferUnits || !pin || !userId) {
      return NextResponse.json({ success: false, message: 'Missing required fields including PIN!' }, { status: 400 });
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

    const assignmentRow = currentAssignment[0];
    const customerCnic = assignmentRow.cnic;
    const existingUnits = Number(assignmentRow.customerUnit || 0);
    const unitsToMove = Number(transferUnits);

    if (unitsToMove > existingUnits) {
      return NextResponse.json({ success: false, message: `Cannot transfer ${unitsToMove} units. Customer only has ${existingUnits} units in this assignment!` }, { status: 400 });
    }

    // B. Verify Customer PIN from customer_pins table
    const pinRecord = await db
      .select()
      .from(customerPins)
      .where(eq(customerPins.cnic, customerCnic))
      .limit(1);

    if (pinRecord.length === 0 || pinRecord[0].pin !== pin) {
      return NextResponse.json({ success: false, message: 'Invalid customer PIN verification failed!' }, { status: 401 });
    }

    // C. Verify target inventory exists and check available units
    const targetInv = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, newInventoryId))
      .limit(1);

    if (targetInv.length === 0) {
      return NextResponse.json({ success: false, message: 'Target inventory not found!' }, { status: 404 });
    }

    const targetInvItem = targetInv[0];
    const targetPricePerUnit = 100000;

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

    const totalAssignedInTarget = Number(assignedResult[0]?.totalAssigned || 0);
    const targetPropertyPrice = Number(targetInvItem.price || 0);
    const totalUnitsInTarget = targetPropertyPrice > 0 ? Math.round(targetPropertyPrice / 100000) : 100;
    const availableUnitsInTarget = totalUnitsInTarget - totalAssignedInTarget;

    if (unitsToMove > availableUnitsInTarget) {
      return NextResponse.json({
        success: false,
        message: `Target inventory does not have enough units! Required: ${unitsToMove}, Available: ${availableUnitsInTarget}`
      }, { status: 400 });
    }

    // D. Check if target inventory already has an active row with the SAME PLAN for this customer (excluding current row)
    const existingTargetRows = await db
      .select()
      .from(inventoryProfit)
      .where(
        and(
          eq(inventoryProfit.cnic, customerCnic),
          eq(inventoryProfit.inventoryId, newInventoryId),
          eq(inventoryProfit.plan, assignmentRow.plan),
          eq(inventoryProfit.status, 'Active'),
          not(eq(inventoryProfit.id, assignmentId))
        )
      );

    const targetRow = existingTargetRows.length > 0 ? existingTargetRows[0] : null;

    if (unitsToMove === existingUnits) {
      // --- FULL TRANSFER (All units moved) ---
      if (targetRow) {
        // Target row with same plan exists: Merge units into target row and DELETE source row
        const updatedUnits = Number(targetRow.customerUnit) + unitsToMove;
        const updatedInvPrice = targetPricePerUnit * updatedUnits;

        await db
          .update(inventoryProfit)
          .set({
            customerUnit: updatedUnits,
            inventoryPrice: updatedInvPrice,
          })
          .where(eq(inventoryProfit.id, targetRow.id));

        // Delete source empty row completely
        await db
          .delete(inventoryProfit)
          .where(eq(inventoryProfit.id, assignmentId));
      } else {
        // Target row does not exist: Simply update source row to point to new inventory & price
        const newInventoryPrice = targetPricePerUnit * unitsToMove;
        await db
          .update(inventoryProfit)
          .set({
            inventoryId: newInventoryId,
            inventoryPrice: newInventoryPrice,
            totalPrice: targetPropertyPrice,
          })
          .where(eq(inventoryProfit.id, assignmentId));
      }
    } else {
      // --- PARTIAL TRANSFER (Some units moved, some remain) ---
      const remainingOldUnits = existingUnits - unitsToMove;
      const oldPricePerUnit = Number(assignmentRow.inventoryPrice) / existingUnits;
      const oldInventoryPrice = oldPricePerUnit * remainingOldUnits;

      // Update source row with remaining units
      await db
        .update(inventoryProfit)
        .set({
          customerUnit: remainingOldUnits,
          inventoryPrice: oldInventoryPrice,
        })
        .where(eq(inventoryProfit.id, assignmentId));

      if (targetRow) {
        // Target row with same plan exists: Merge transferred units into target row
        const updatedUnits = Number(targetRow.customerUnit) + unitsToMove;
        const updatedInvPrice = targetPricePerUnit * updatedUnits;

        await db
          .update(inventoryProfit)
          .set({
            customerUnit: updatedUnits,
            inventoryPrice: updatedInvPrice,
          })
          .where(eq(inventoryProfit.id, targetRow.id));
      } else {
        // Target row does not exist: Create a new row for target inventory
        await db.insert(inventoryProfit).values({
          id: crypto.randomUUID(),
          customerId: assignmentRow.customerId,
          cnic: customerCnic,
          inventoryId: newInventoryId,
          inventoryPrice: targetPricePerUnit * unitsToMove,
          totalPrice: targetPropertyPrice,
          customerUnit: unitsToMove,
          plan: assignmentRow.plan,
          date: assignmentRow.date,
          profitDate: assignmentRow.profitDate,
          status: 'Active',
        });
      }
    }

    // E. Log Activity
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      officeUserId: userId,
      action: 'SHIFT_CUSTOMER_INVENTORY_UNITS',
      remarks: remarks || `Successfully transferred ${unitsToMove} units for CNIC: ${customerCnic} with PIN verification.`,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Customer units successfully transferred, merged where applicable, and logged!' 
    }, { status: 200 });

  } catch (error) {
    console.error('Shift Inventory Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}