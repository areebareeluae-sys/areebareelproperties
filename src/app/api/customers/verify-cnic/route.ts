import { NextResponse } from 'next/server';
import { db } from '@/db';
import { formApplications, inventoryProfit, inventory } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cnic = url.searchParams.get('cnic');

    if (!cnic) {
      return NextResponse.json({ success: false, message: 'CNIC parameter is required' }, { status: 400 });
    }

    // 1. Check Customer in formApplications table first
    const customers = await db
      .select()
      .from(formApplications)
      .where(eq(formApplications.cnic, cnic))
      .limit(1);

    if (customers.length === 0) {
      return NextResponse.json({ success: false, message: 'Customer CNIC not found in applications!' }, { status: 404 });
    }

    const customer = customers[0];

    // 2. Status check: Agar status Complete, Approved ya Completed nahi hai
    const currentStatus = customer.status ? customer.status.toLowerCase() : 'pending';
    if (currentStatus !== 'complete' && currentStatus !== 'approved' && currentStatus !== 'completed') {
      return NextResponse.json({ 
        success: false, 
        message: `Your application status is '${customer.status || 'Pending'}'. It must be Complete/Approved to assign property.` 
      }, { status: 400 });
    }

    // 3. Fetch all existing assigned properties and units for this CNIC (Allows multiple property assignments)
    const existingAssignments = await db
      .select({
        propertyTitle: inventory.property_title,
        units: inventoryProfit.customerUnit,
        plan: inventoryProfit.plan,
        date: inventoryProfit.date,
      })
      .from(inventoryProfit)
      .innerJoin(inventory, eq(inventoryProfit.inventoryId, inventory.id))
      .where(eq(inventoryProfit.cnic, cnic));

    const totalAssignedUnits = existingAssignments.reduce((sum, item) => sum + item.units, 0);

    // Optional Check: Agar koi user 20 units ki absolute limit poori kar chuka hai
    if (totalAssignedUnits >= 20) {
      return NextResponse.json({ 
        success: false, 
        message: `Maximum limit reached! This customer already owns 20 units (the maximum allowed per CNIC).` 
      }, { status: 400 });
    }

    const formattedCustomer = {
      id: customer.id,
      name: customer.fullName,
      phone: customer.mobile,
      cnic: customer.cnic,
      status: customer.status,
      totalAssignedUnits,
      assignments: existingAssignments
    };

    return NextResponse.json({ success: true, customer: formattedCustomer }, { status: 200 });
  } catch (error) {
    console.error('Verify CNIC Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}