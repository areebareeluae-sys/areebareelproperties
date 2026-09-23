import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 1. PUT: User ko update karne ke liye (Name, CNIC, Phone, Password sab update honge)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, cnic, phone, password } = await req.json();

    if (!name || !cnic || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name, CNIC, and Phone are required.' },
        { status: 400 }
      );
    }

    const updateData: any = { name, cnic, phone };
    
    // Agar naya password diya gaya hai toh hi update karein
    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser || updatedUser.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'User updated successfully.', data: updatedUser[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update User Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user in database.' },
      { status: 500 }
    );
  }
}

// 2. DELETE: User ko delete karne ke liye
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deletedUser || deletedUser.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'User deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete User Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete user from database.' },
      { status: 500 }
    );
  }
}