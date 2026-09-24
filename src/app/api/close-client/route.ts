import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventoryProfit, customerPaymentMethods, customerPins, inventory, pendingAmmount } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// Precise Profit Calculation based on plan specifications
function calculatePendingProfit(plan: string, customerUnit: number, profitDateStr: string) {
  if (!profitDateStr || profitDateStr === "00/00/00" || !customerUnit) return 0;

  // ISO string ya time component ko remove kar ke sirf date nikalna
  let cleanDateStr = String(profitDateStr).trim().split("T")[0];
  const nextProfitDate = new Date(cleanDateStr);

  if (isNaN(nextProfitDate.getTime())) return 0;

  // Cycle start date calculation (1 month back from next profit date)
  const cycleStartDate = new Date(nextProfitDate);
  cycleStartDate.setMonth(cycleStartDate.getMonth() - 1);

  const today = new Date();
  // Time ko zero kar dein taake exact day diff aye
  today.setHours(0, 0, 0, 0);
  cycleStartDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - cycleStartDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 0;

  let monthlyRatePerUnit = 0;
  const planLower = plan ? plan.trim().toLowerCase() : "";

  if (planLower.includes("dual_benefit") || planLower.includes("dual benefit")) {
    monthlyRatePerUnit = 2200;
  } else if (planLower.includes("capital_gain") || planLower.includes("capital gain")) {
    monthlyRatePerUnit = 800;
  } else {
    const baseValue = Number(customerUnit) * 100000;
    monthlyRatePerUnit = (baseValue * 0.08) / 12;
  }

  const perDayProfit = (monthlyRatePerUnit * Number(customerUnit)) / 30;
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

    // Filter only active records
    const activeRecords = records.filter(
      (item) => item.status && item.status.trim().toLowerCase() === "active"
    );

    if (activeRecords.length === 0) {
      return NextResponse.json({ success: false, message: "No active plans found for this CNIC." }, { status: 400 });
    }

    // Fetch payment methods
    const paymentMethods = await db
      .select()
      .from(customerPaymentMethods)
      .where(eq(customerPaymentMethods.cnic, cnic));

    // Enrich records with calculated profit and inventory detailed information
    const enrichedRecords = await Promise.all(
      activeRecords.map(async (item) => {
        const calculatedProfit = calculatePendingProfit(item.plan, item.customerUnit, item.profitDate);
        
        let inventoryDetails = null;
        if (item.inventoryId && item.inventoryId !== "0") {
          const invResult = await db
            .select()
            .from(inventory)
            .where(eq(inventory.id, item.inventoryId));
          if (invResult.length > 0) {
            inventoryDetails = invResult[0];
          }
        }

        return {
          ...item,
          calculatedProfit,
          inventoryDetails,
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      data: {
        activeRecords: enrichedRecords,
        paymentMethods
      } 
    });
  } catch (error) {
    console.error("Error fetching client data:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { id, cnic, pin, refundUnits, settlementRemarks } = await req.json();

    if (!id || !cnic || !pin || refundUnits === undefined) {
      return NextResponse.json({ success: false, message: "Missing required fields or PIN" }, { status: 400 });
    }

    // 1. Verify Customer PIN
    const pinRecord = await db
      .select()
      .from(customerPins)
      .where(eq(customerPins.cnic, cnic));

    if (pinRecord.length === 0 || pinRecord[0].pin !== String(pin).trim()) {
      return NextResponse.json({ success: false, message: "Invalid Customer PIN! Cannot process." }, { status: 400 });
    }

    // 2. Get target inventory profit record
    const targetRecord = await db
      .select()
      .from(inventoryProfit)
      .where(eq(inventoryProfit.id, id));

    if (targetRecord.length === 0) {
      return NextResponse.json({ success: false, message: "Record not found." }, { status: 404 });
    }

    const currentItem = targetRecord[0];
    const unitsToRefund = Number(refundUnits);

    if (unitsToRefund > currentItem.customerUnit) {
      return NextResponse.json({ success: false, message: "Refund units cannot exceed current customer units." }, { status: 400 });
    }

    // Calculate prorated amount for the refunded units proportion
    const fullCalculatedProfit = calculatePendingProfit(currentItem.plan, currentItem.customerUnit, currentItem.profitDate);
    const proratedRefundAmount = Math.round((fullCalculatedProfit / currentItem.customerUnit) * unitsToRefund);

    // 3. Add to pending_ammount table
    await db.insert(pendingAmmount).values({
      id: randomUUID(),
      cnic: cnic,
      ammount: proratedRefundAmount,
      profitdate: currentItem.profitDate,
      reson: `Refund of ${unitsToRefund} units from plan ${currentItem.plan}`,
      status: "pending",
      remarks: settlementRemarks || null,
      sendData: null,
    });

    const remainingUnits = currentItem.customerUnit - unitsToRefund;

    if (remainingUnits <= 0) {
      // Delete record from inventoryProfit if units become 0
      await db.delete(inventoryProfit).where(eq(inventoryProfit.id, id));
    } else {
      // Update with remaining units and proportionally scaled price values
      const unitRatio = remainingUnits / currentItem.customerUnit;
      await db
        .update(inventoryProfit)
        .set({
          customerUnit: remainingUnits,
          totalPrice: currentItem.totalPrice * unitRatio,
          inventoryPrice: currentItem.inventoryPrice * unitRatio,
        })
        .where(eq(inventoryProfit.id, id));
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully refunded ${unitsToRefund} units. Amount Rs. ${proratedRefundAmount} added to pending balances.` 
    });
  } catch (error) {
    console.error("Error processing client refund:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}