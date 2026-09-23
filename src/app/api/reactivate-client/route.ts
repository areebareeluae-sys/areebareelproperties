import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryProfit } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// GET: Search only closed clients by CNIC
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cnic = searchParams.get("cnic");

    if (!cnic) {
      return NextResponse.json({ success: false, message: "CNIC is required" }, { status: 400 });
    }

    const records = await db
      .select()
      .from(inventoryProfit)
      .where(
        and(
          eq(inventoryProfit.cnic, cnic),
          sql`LOWER(${inventoryProfit.status}) = 'closed'`
        )
      );

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Error fetching client for reactivation:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Reactivate client and assign new property/inventory
export async function POST(req: Request) {
  try {
    const { id, plan, customerUnit, inventoryId, inventoryTotalPrice, profitDate } = await req.json();

    if (!id || !customerUnit || !inventoryId || !profitDate) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    const units = Number(customerUnit);
    if (units < 2 || units > 20) {
      return NextResponse.json({ success: false, message: "Units must be between 2 and 20" }, { status: 400 });
    }

    // inventoryPrice column mein units * 100,000 save hoga
    const calculatedInventoryPrice = units * 100000; 

    await db
      .update(inventoryProfit)
      .set({
        status: "Active",
        plan: plan || "Gold8*F",
        customerUnit: units,
        inventoryId: String(inventoryId),
        totalPrice: Number(inventoryTotalPrice), // Inventory ki apni total price
        inventoryPrice: calculatedInventoryPrice, // Units * 100,000
        profitDate: profitDate,
      })
      .where(eq(inventoryProfit.id, id));

    return NextResponse.json({ 
      success: true, 
      message: "Client successfully reactivated and new property assigned!" 
    });
  } catch (error) {
    console.error("Error reactivating client:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}