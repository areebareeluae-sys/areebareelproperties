import { NextResponse } from 'next/server';
import { db } from '@/db';
import { formApplications, departments, applicationLogs } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import crypto from 'crypto';

// 1. GET Method: Department ke mutabiq applications fetch karne ke liye
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    let applications;

    if (departmentId) {
      applications = await db
        .select()
        .from(formApplications)
        .where(eq(formApplications.currentDepartmentId, departmentId));
    } else {
      applications = await db
        .select()
        .from(formApplications);
    }

    return NextResponse.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, message: 'Applications fetch karne mein nakami hui.' },
      { status: 500 }
    );
  }
}

// 2. POST Method: Accept / Forward ya Reject action ke liye
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appId, currentDeptId, officeUserId, actionType, remarks } = body;

    if (!appId || !currentDeptId || !officeUserId || !actionType) {
      return NextResponse.json(
        { success: false, message: 'Zaroori fields missing hain.' },
        { status: 400 }
      );
    }

    const allDepts = await db.select().from(departments).orderBy(asc(departments.stepOrder));
    const currentIndex = allDepts.findIndex(d => d.id === currentDeptId);

    let nextDeptId = currentDeptId;
    let newStatus = 'Pending';

    if (actionType === 'REJECTED') {
      newStatus = 'Rejected';
      
      // Dynamic lookup: Department 4 ko stepOrder ya index ke zariye find karein taake foreign key match ho jaye
      const targetDept = allDepts.find(d => d.stepOrder === 4) || allDepts[3];
      if (targetDept) {
        nextDeptId = targetDept.id;
      }
    } else if (currentIndex !== -1 && currentIndex < allDepts.length - 1) {
      nextDeptId = allDepts[currentIndex + 1].id;
      newStatus = 'Forwarded';
    } else {
      newStatus = 'Completed';
    }

    await db.update(formApplications)
      .set({ 
        currentDepartmentId: nextDeptId, 
        status: newStatus 
      })
      .where(eq(formApplications.id, appId));

    await db.insert(applicationLogs).values({
      id: crypto.randomUUID(),
      formAppId: appId,
      officeUserId: officeUserId,
      fromDepartmentId: currentDeptId,
      toDepartmentId: nextDeptId,
      action: actionType,
      remarks: remarks || '',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      message: actionType === 'REJECTED' 
        ? 'Application reject ho kar automatically Department 4 ke paas chali gayi hai.' 
        : 'Application successfully processed!' 
    });

  } catch (error) {
    console.error('Error in admin action API:', error);
    return NextResponse.json(
      { success: false, message: 'Application process karne mein nakami hui.' },
      { status: 500 }
    );
  }
}