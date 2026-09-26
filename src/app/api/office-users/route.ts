import { NextResponse } from 'next/server';
import { db } from '@/db';
import { officeUsers, departments, activityLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

// --- GET: Fetch Users and Departments ---
export async function GET(req: Request) {
  try {
    const users = await db.select().from(officeUsers);
    const allDepartments = await db.select().from(departments);

    return NextResponse.json({ success: true, users, departments: allDepartments }, { status: 200 });
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// --- POST: Create User & Log Activity ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, departmentId, role, actorId } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Name, email and password are required!' }, { status: 400 });
    }

    // Email ko lowercase (chhote alphabets) mein convert karna
    const formattedEmail = email.trim().toLowerCase();

    const existingUser = await db.select().from(officeUsers).where(eq(officeUsers.email, formattedEmail)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, message: 'Email already exists!' }, { status: 400 });
    }

    const newId = crypto.randomUUID();

    // 1. Insert User with lowercase email
    await db.insert(officeUsers).values({
      id: newId,
      name,
      email: formattedEmail,
      password,
      departmentId: departmentId || null,
      role: role || 'staff',
    });

    // 2. Log Activity in activityLogs
    if (actorId) {
      await db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        officeUserId: actorId,
        action: 'CREATE_USER',
        remarks: `Created new office user: ${name} (${formattedEmail}) with role: ${role || 'staff'}`,
      });
    }

    return NextResponse.json({ success: true, message: 'Office user created successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Create User Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// --- PUT: Update User & Log Activity ---
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, email, departmentId, password, isActive, actorId } = body; // Agar email update mein bhi ho sakti hai toh handle kar lein

    if (!id) {
      return NextResponse.json({ success: false, message: 'User ID is required!' }, { status: 400 });
    }

    const targetUser = await db.select().from(officeUsers).where(eq(officeUsers.id, id)).limit(1);
    const oldUserData = targetUser[0];

    if (!oldUserData) {
      return NextResponse.json({ success: false, message: 'Target user not found!' }, { status: 404 });
    }

    const updateData: any = {};
    if (email) updateData.email = email.trim().toLowerCase(); // Agar email update ho rahi ho toh usay bhi lowercase karein
    if (departmentId !== undefined) updateData.departmentId = departmentId || null;
    if (password) updateData.password = password;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: 'No fields provided for update!' }, { status: 400 });
    }

    // 1. Update User
    await db.update(officeUsers).set(updateData).where(eq(officeUsers.id, id));

    // 2. Determine Action for Logs
    let actionName = 'UPDATE_USER';
    let logRemarks = `Updated user ${oldUserData.email}: `;
    
    if (isActive !== undefined && isActive !== oldUserData.isActive) {
      actionName = isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER';
      logRemarks = `Changed status of ${oldUserData.email} to ${isActive ? 'Active' : 'Deactivated'}`;
    } else {
      const changes = [];
      if (email) changes.push(`Email updated`);
      if (departmentId !== undefined) changes.push(`Department updated`);
      if (password) changes.push(`Password changed`);
      logRemarks += changes.join(', ');
    }

    // 3. Log Activity in activityLogs
    if (actorId) {
      await db.insert(activityLogs).values({
        id: crypto.randomUUID(),
        officeUserId: actorId,
        action: actionName,
        remarks: logRemarks,
      });
    }

    return NextResponse.json({ success: true, message: 'User updated successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Update User Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}