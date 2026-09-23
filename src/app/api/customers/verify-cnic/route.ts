import { NextResponse } from 'next/server';
import { db } from '@/db';
import { formApplications, inventoryProfit } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cnic = url.searchParams.get('cnic');

    if (!cnic) {
      return NextResponse.json({ success: false, message: 'CNIC parameter is required' }, { status: 400 });
    }

    // 1. Check if this CNIC already exists in inventory_profit (Already Assigned Check)
    const existingAssignment = await db
      .select()
      .from(inventoryProfit)
      .where(eq(inventoryProfit.cnic, cnic))
      .limit(1);

    if (existingAssignment.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Already Property Assigned! This customer already owns a property unit.' 
      }, { status: 400 });
    }

    // 2. Check Customer in formApplications table
    const customers = await db
      .select()
      .from(formApplications)
      .where(eq(formApplications.cnic, cnic))
      .limit(1);

    if (customers.length === 0) {
      return NextResponse.json({ success: false, message: 'Customer CNIC not found in applications!' }, { status: 404 });
    }

    const customer = customers[0];

    // 3. Status check: Agar status Complete ya Approved nahi hai
    const currentStatus = customer.status ? customer.status.toLowerCase() : 'pending';
    if (currentStatus !== 'complete' && currentStatus !== 'approved' && currentStatus !== 'completed') {
      return NextResponse.json({ 
        success: false, 
        message: `Your application status is '${customer.status || 'Pending'}'. It must be Complete/Approved to assign property.` 
      }, { status: 400 });
    }

    const formattedCustomer = {
      id: customer.id,
      name: customer.fullName,
      phone: customer.mobile,
      cnic: customer.cnic,
      status: customer.status
    };

    return NextResponse.json({ success: true, customer: formattedCustomer }, { status: 200 });
  } catch (error) {
    console.error('Verify CNIC Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}