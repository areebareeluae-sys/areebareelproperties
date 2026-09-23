import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryProfit } from "@/db/schema";
import { eq } from "drizzle-orm";

// Robust Profit Calculation Function
function calculatePendingProfit(plan: string, customerUnit: number, profitDateStr: string) {
  if (!profitDateStr || profitDateStr === "00/00/00" || !customerUnit) return 0;

  let cleanDateStr = String(profitDateStr).trim();
  const nextProfitDate = new Date(cleanDateStr);

  if (isNaN(nextProfitDate.getTime())) return 0;

  // Cycle start date calculation (1 month back from next profit date)
  const cycleStartDate = new Date(nextProfitDate);
  cycleStartDate.setMonth(cycleStartDate.getMonth() - 1);

  const today = new Date();

  // Days difference from cycle start date to today
  const diffTime = today.getTime() - cycleStartDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 0;

  // 1. unit * 100,000
  const baseValue = Number(customerUnit) * 100000;

  // 2. 8% of that value
  const eightPercentValue = baseValue * 0.08;

  // 3. Divide by 12
  let result = eightPercentValue / 12;

  // 4. Plan check: Gold8*F mein 1400 add karna hai
  if (plan && plan.trim().toLowerCase() === "gold8*f") {
    result += 1400;
  }

  // 5. Divide by 30 to get per day profit
  const perDayProfit = result / 30;

  // Total profit up to today from the start of the current cycle
  return Math.round(diffDays * perDayProfit);
}

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
      .where(eq(inventoryProfit.cnic, cnic));

    if (records.length === 0) {
      return NextResponse.json({ success: false, message: "No records found for this CNIC." }, { status: 404 });
    }

    // Check if the record is Closed/Deactivated
    const isClosed = records.some(
      (item) => !item.status || item.status.trim().toLowerCase() === "closed"
    );

    if (isClosed) {
      return NextResponse.json({ success: false, message: "CNIC is deactivated" }, { status: 400 });
    }

    // Filter only active records and calculate profit
    const activeRecords = records.filter(
      (item) => item.status && item.status.trim().toLowerCase() === "active"
    );

    if (activeRecords.length === 0) {
      return NextResponse.json({ success: false, message: "CNIC is deactivated" }, { status: 400 });
    }

    const enrichedRecords = activeRecords.map((item) => {
      const calculatedProfit = calculatePendingProfit(item.plan, item.customerUnit, item.profitDate);
      return {
        ...item,
        calculatedProfit,
      };
    });

    return NextResponse.json({ success: true, data: enrichedRecords });
  } catch (error) {
    console.error("Error fetching client data:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, settlementRemarks } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    // Database update query to close the client and reset values as requested
    await db
      .update(inventoryProfit)
      .set({
        status: "Closed",
        profitDate: "00/00/00",
        customerUnit: 0,
        totalPrice: 0,
        inventoryPrice: 0,
        inventoryId: "0",
      })
      .where(eq(inventoryProfit.id, id));

    return NextResponse.json({ 
      success: true, 
      message: `Client successfully closed with remarks: ${settlementRemarks || 'N/A'}` 
    });
  } catch (error) {
    console.error("Error closing client:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}