import { NextResponse } from 'next/server';
import { db } from '@/db'; 
import { inventoryProfit, inventory } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET: Fetch inventory profit records ONLY when CNIC is provided
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cnic = searchParams.get('cnic');

    // Agar CNIC provide nahi ki gai, toh empty array return karein (auto show nahi hoga)
    if (!cnic || cnic.trim() === '') {
      return NextResponse.json({ success: true, assignments: [] }, { status: 200 });
    }

    let query = db
      .select({
        id: inventoryProfit.id,
        customerId: inventoryProfit.customerId,
        cnic: inventoryProfit.cnic,
        inventoryId: inventoryProfit.inventoryId,
        inventoryName: inventory.property_title,
        inventoryPrice: inventoryProfit.inventoryPrice,
        totalPrice: inventoryProfit.totalPrice,
        customerUnit: inventoryProfit.customerUnit,
        plan: inventoryProfit.plan,
        date: inventoryProfit.date,
        profitDate: inventoryProfit.profitDate,
        status: inventoryProfit.status,
      })
      .from(inventoryProfit)
      .leftJoin(inventory, eq(inventoryProfit.inventoryId, inventory.id));

    const results = await query;

    // Filter by CNIC
    const filtered = results.filter(item => item.cnic && item.cnic.toLowerCase().includes(cnic.toLowerCase()));

    return NextResponse.json({ success: true, assignments: filtered }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Update status (Active / Deactivated)
export async function POST(req: Request) {
  try {
    const { assignmentId, status } = await req.json();

    if (!assignmentId || !status) {
      return NextResponse.json({ success: false, message: 'Missing assignmentId or status' }, { status: 400 });
    }

    await db
      .update(inventoryProfit)
      .set({ status })
      .where(eq(inventoryProfit.id, assignmentId));

    return NextResponse.json({ success: true, message: `Status updated to ${status} successfully!` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}