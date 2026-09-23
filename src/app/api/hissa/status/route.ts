import { NextResponse } from "next/server";
import { db } from "@/db";
import { formApplications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'cnic' or 'appNo'
    const value = searchParams.get("value");

    if (!type || !value) {
      return NextResponse.json({ success: false, message: "Missing search parameters." }, { status: 400 });
    }

    let result;
    if (type === "appNo") {
      result = await db
        .select()
        .from(formApplications)
        .where(eq(formApplications.appNo, value))
        .limit(1);
    } else if (type === "cnic") {
      result = await db
        .select()
        .from(formApplications)
        .where(eq(formApplications.cnic, value))
        .limit(1);
    }

    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, message: "No application found with this detail." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}