import { NextResponse } from "next/server";
import { db } from "@/db"; 
import { inventoryProfit, customerPaymentMethods } from "@/db/schema";
import { eq } from "drizzle-orm";

// 1. GET: inventoryProfit mein CNIC check karna + Yeh bhi dekhna ke kya payment method pehle se added hai
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cnic = searchParams.get("cnic");

    if (!cnic) {
      return NextResponse.json({ success: false, message: "CNIC is required" }, { status: 400 });
    }

    // inventoryProfit table mein check karein
    const assignments = await db
      .select()
      .from(inventoryProfit)
      .where(eq(inventoryProfit.cnic, cnic));

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No property assigned to this CNIC yet!" 
      }, { status: 404 });
    }

    // Check karein ke kya is CNIC ka payment method pehle se saved hai
    const existingPayment = await db
      .select()
      .from(customerPaymentMethods)
      .where(eq(customerPaymentMethods.cnic, cnic));

    return NextResponse.json({
      success: true,
      hasAssignment: true,
      assignments: assignments,
      existingPayment: existingPayment.length > 0 ? existingPayment[0] : null
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Server Error" }, { status: 500 });
  }
}

// 2. POST: Payment Method Save ya Update karna (Single record per CNIC)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cnic, accountHolder, accountNumber, bankName } = body;

    if (!cnic || !accountHolder || !accountNumber || !bankName) {
      return NextResponse.json({ success: false, message: "All fields are required!" }, { status: 400 });
    }

    // Dobara verify karein ke inventoryProfit mein record mojood hai
    const checkAssignment = await db
      .select()
      .from(inventoryProfit)
      .where(eq(inventoryProfit.cnic, cnic));

    if (!checkAssignment || checkAssignment.length === 0) {
      return NextResponse.json({ success: false, message: "Unauthorized: No property assigned for this CNIC." }, { status: 403 });
    }

    // Check karein ke payment method pehle se added hai ya nahi
    const existingPayment = await db
      .select()
      .from(customerPaymentMethods)
      .where(eq(customerPaymentMethods.cnic, cnic));

    if (existingPayment.length > 0) {
      // Agar pehle se mojood hai toh UPDATE karein
      await db
        .update(customerPaymentMethods)
        .set({
          accountHolder,
          accountNumber,
          bankName,
          createdAt: new Date().toISOString(), // Update timestamp agar chahein
        })
        .where(eq(customerPaymentMethods.cnic, cnic));

      return NextResponse.json({
        success: true,
        message: "Payment method updated successfully!",
      });
    } else {
      // Agar pehle se mojood nahi hai toh INSERT karein
      await db.insert(customerPaymentMethods).values({
        cnic,
        accountHolder,
        accountNumber,
        bankName,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: "Payment method saved successfully!",
      });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Server Error" }, { status: 500 });
  }
}