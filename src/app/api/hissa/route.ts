import { NextResponse } from "next/server";
import { db } from "@/db"; 
import { formApplications, users } from "@/db/schema"; // users table import kar lia
import { desc, eq } from "drizzle-orm";
import crypto from "crypto"; 

// GET route
export async function GET() {
  try {
    const lastApp = await db
      .select({ appNo: formApplications.appNo })
      .from(formApplications)
      .orderBy(desc(formApplications.createdAt))
      .limit(1);

    let nextAppNo = "HISA-00001";
    if (lastApp.length > 0 && lastApp[0].appNo) {
      const numericPart = parseInt(lastApp[0].appNo.replace(/\D/g, "")) || 0;
      nextAppNo = `HISA-${String(numericPart + 1).padStart(5, "0")}`;
    }

    return NextResponse.json({ success: true, appNo: nextAppNo });
  } catch (error) {
    console.error("Error generating app no:", error);
    return NextResponse.json({ success: false, appNo: "HISA-00001" }, { status: 500 });
  }
}

// POST: Form Data Save + Auto User Creation (Transaction Safe)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic Validation
    if (!body.fullName || !body.cnic || !body.mobile) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (fullName, cnic, mobile)." },
        { status: 400 }
      );
    }

    // Database Transaction
    const { generatedAppNo, assignedUserId } = await db.transaction(async (tx) => {
      // 1. CNIC Duplicate Check inside transaction (for applications)
      const existingApplication = await tx
        .select()
        .from(formApplications)
        .where(eq(formApplications.cnic, body.cnic))
        .limit(1);

      if (existingApplication.length > 0) {
        throw new Error(`CNIC_EXISTS:${body.cnic}`);
      }

      // 2. Generate Unique App No
      const lastApp = await tx
        .select({ appNo: formApplications.appNo })
        .from(formApplications)
        .orderBy(desc(formApplications.createdAt))
        .limit(1);

      let nextAppNo = "HISA-00001";
      if (lastApp.length > 0 && lastApp[0].appNo) {
        const numericPart = parseInt(lastApp[0].appNo.replace(/\D/g, "")) || 0;
        nextAppNo = `HISA-${String(numericPart + 1).padStart(5, "0")}`;
      }

      // 3. Handle Auto User Creation / Check
      let userIdToUse = body.userId || null;

      if (!userIdToUse) {
        // Check if user already exists with this CNIC
        const existingUser = await tx
          .select()
          .from(users)
          .where(eq(users.cnic, body.cnic))
          .limit(1);

        if (existingUser.length > 0) {
          userIdToUse = existingUser[0].id;
        } else {
          // Generate new user ID
          userIdToUse = crypto.randomUUID();

          // Extract last 6 digits of CNIC for password (removing dashes/symbols)
          const cleanCnic = body.cnic.replace(/\D/g, "");
          const autoPassword = cleanCnic.slice(-6) || "123456";

          // Insert new user automatically
          await tx.insert(users).values({
            id: userIdToUse,
            name: body.fullName,
            cnic: body.cnic,
            phone: body.mobile,
            password: autoPassword, // Note: Aap chahein toh yahan bcrypt se hash bhi kar sakte hain agar signup mein hashing use hoti hai
            createdAt: new Date().toISOString(),
          });
        }
      }

      const uniqueId = crypto.randomUUID();

      // 4. Insert new application with generated appNo and linked userId
      await tx.insert(formApplications).values({
        id: uniqueId,
        userId: userIdToUse, 
        appNo: nextAppNo,
        date: body.date,
        fullName: body.fullName,
        cnic: body.cnic,
        fatherName: body.fatherName,
        dob: body.dob || null,
        mobile: body.mobile,
        altContact: body.altContact || null,
        address: body.address || null,
        
        photoUrl: body.photoUrl || null,          
        cnicFrontUrl: body.cnicFrontUrl || null,   
        cnicBackUrl: body.cnicBackUrl || null,   

        categories: JSON.stringify(body.categories || []), 
        applicantIncome: Number(body.applicantIncome) || 0,
        householdIncome: Number(body.householdIncome) || 0,
        applicantIncomeType: body.applicantIncomeType || null,
        livingArrangement: body.livingArrangement || null,
        earningMembers: body.earningMembers ? String(body.earningMembers) : null,
        dependents: body.dependents ? String(body.dependents) : null,
        participationAmount: Number(body.participationAmount) || 0,
        nomineeName: body.nomineeName || null,
        nomineeRelation: body.nomineeRelation || null,
        nomineeCnic: body.nomineeCnic || null,
        nomineeMobile: body.nomineeMobile || null,
        declarationAccepted: Boolean(body.declarationAccepted),
        status: "Pending",
        currentDepartmentId: "dept_1",
      });

      return { generatedAppNo: nextAppNo, assignedUserId: userIdToUse };
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Application saved and user account created successfully!", 
        appNo: generatedAppNo,
        userId: assignedUserId
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Database Insert Error:", error);

    if (error.message && error.message.startsWith("CNIC_EXISTS:")) {
      const cnic = error.message.split(":")[1];
      return NextResponse.json(
        { success: false, message: `An application with this CNIC (${cnic}) already exists!` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal Server Error during database insertion." },
      { status: 500 }
    );
  }
}