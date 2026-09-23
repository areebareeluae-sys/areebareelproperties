import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, officeUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Enter Valid Login Credentials' },
        { status: 400 }
      );
    }

    const isEmail = identifier.includes('@');

    // 1. AGAR EMAIL HAI TOH OFFICE USERS TABLE CHECK KAREIN
    if (isEmail) {
      const existingOfficeUser = await db
        .select()
        .from(officeUsers)
        .where(eq(officeUsers.email, identifier))
        .limit(1);

      if (existingOfficeUser.length > 0) {
        const staff = existingOfficeUser[0];

        // Password check
        if (staff.password !== password) {
          return NextResponse.json(
            { success: false, message: 'invalid password' },
            { status: 401 }
          );
        }

        return NextResponse.json(
          { 
            success: true, 
            message: 'Office login successful', 
            role: 'office', 
            data: { 
              id: staff.id,
              name: staff.name, 
              email: staff.email, 
              departmentId: staff.departmentId, 
              userRole: staff.role 
            } 
          },
          { status: 200 }
        );
      }
    }

    // 2. AGAR CNIC HAI (YA OFFICE USER EMAIL SE NAHI MILA) TOH CLIENT USERS TABLE CHECK KAREIN
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.cnic, identifier))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { success: false, message: isEmail ? 'invalid email or password' : 'invalid cnic or password' },
        { status: 401 }
      );
    }

    const user = existingUser[0];

    // Password match check
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'invalid password' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Client login successful', 
        role: 'client', 
        data: { 
          id: user.id,
          name: user.name, 
          phone: user.phone,
          cnic: user.cnic
        } 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Signin Error:', error);
    return NextResponse.json(
      { success: false, message: 'Server Busy' },
      { status: 500 }
    );
  }
}