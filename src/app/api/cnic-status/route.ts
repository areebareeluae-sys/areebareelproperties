import { NextResponse } from "next/server";
import { db } from "@/db";
import { formApplications, inventoryProfit, transactionHistory, inventory } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cnic = searchParams.get("cnic");

    if (!cnic) {
      return NextResponse.json({ success: false, message: "CNIC is required" }, { status: 400 });
    }

    // 1. Fetch Application / Personal Details
    const [application] = await db
      .select()
      .from(formApplications)
      .where(eq(formApplications.cnic, cnic));

    if (!application) {
      return NextResponse.json({ success: false, message: "No record found against this CNIC" }, { status: 404 });
    }

    // 2. Fetch Inventory Profit / Assignment Details
    const profitRecords = await db
      .select()
      .from(inventoryProfit)
      .where(eq(inventoryProfit.cnic, cnic));

    // 3. Fetch Transaction History
    const rawTransactions = await db
      .select()
      .from(transactionHistory)
      .where(eq(transactionHistory.cnic, cnic));

    // Attach Inventory Details to Transactions if inventoryId exists
    let transactions = [];
    for (const tx of rawTransactions) {
      let invItem = null;
      if (tx.inventoryId) {
        const [foundInv] = await db
          .select()
          .from(inventory)
          .where(eq(inventory.id, tx.inventoryId));
        invItem = foundInv || null;
      }
      transactions.push({
        ...tx,
        inventoryInfo: invItem
      });
    }

    // 4. If inventoryId exists in profit records, fetch Inventory Details
    let inventoryDetailsList = [];
    if (profitRecords.length > 0) {
      for (const record of profitRecords) {
        if (record.inventoryId) {
          const [invItem] = await db
            .select()
            .from(inventory)
            .where(eq(inventory.id, record.inventoryId));
          
          inventoryDetailsList.push({
            profitRecordId: record.id,
            ...record,
            inventoryInfo: invItem || null
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        application,
        inventories: inventoryDetailsList,
        transactions
      }
    });

  } catch (error) {
    console.error("Error fetching CNIC status data:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}