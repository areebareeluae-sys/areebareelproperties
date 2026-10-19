import { NextResponse } from 'next/server';
import { db } from '@/db'; // Adjust path to your DB configuration
import { dealerUsers } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import cloudinary from '../../../lib/cloudinary';

// POST: REGISTER DEALER & UPLOAD CNIC TO CLOUDINARY
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      cnicNumber,
      phoneNumber,
      companyName,
      companyAddress,
      frontCnicImage,
      backCnicImage,
    } = body;

    // 1. Missing Fields Check
    if (
      !name ||
      !email ||
      !cnicNumber ||
      !phoneNumber ||
      !companyName ||
      !companyAddress ||
      !frontCnicImage ||
      !backCnicImage
    ) {
      return NextResponse.json(
        { error: 'All required fields and CNIC images must be provided.' },
        { status: 400 }
      );
    }

    // 2. Text Length Validations (Max 50 / Phone Max 15)
    if (
      name.length > 50 ||
      email.length > 50 ||
      companyName.length > 50 ||
      companyAddress.length > 50
    ) {
      return NextResponse.json(
        { error: 'Text fields cannot exceed 50 characters.' },
        { status: 400 }
      );
    }

    if (phoneNumber.length > 15) {
      return NextResponse.json(
        { error: 'Phone Number cannot exceed 15 characters.' },
        { status: 400 }
      );
    }

    // 3. CNIC Format Validation (33303-3332783-9)
    if (!/^\d{5}-\d{7}-\d{1}$/.test(cnicNumber)) {
      return NextResponse.json(
        { error: 'CNIC format must be XXXXX-XXXXXXX-X (e.g. 33303-3332783-9).' },
        { status: 400 }
      );
    }

    // 4. Unique Check (CNIC, Email, Phone)
    const existingUser = await db
      .select()
      .from(dealerUsers)
      .where(
        or(
          eq(dealerUsers.email, email),
          eq(dealerUsers.cnicNumber, cnicNumber),
          eq(dealerUsers.phoneNumber, phoneNumber)
        )
      )
      .limit(1);

    if (existingUser.length > 0) {
      const user = existingUser[0];
      if (user.cnicNumber === cnicNumber) {
        return NextResponse.json(
          { error: 'An account with this CNIC number is already registered.' },
          { status: 409 }
        );
      }
      if (user.email === email) {
        return NextResponse.json(
          { error: 'This email address is already registered.' },
          { status: 409 }
        );
      }
      if (user.phoneNumber === phoneNumber) {
        return NextResponse.json(
          { error: 'This phone number is already registered.' },
          { status: 409 }
        );
      }
    }

    // 5. Upload Base64 Images to Cloudinary
    const frontUpload = await cloudinary.uploader.upload(frontCnicImage, {
      folder: 'dealer_cnic_documents',
    });

    const backUpload = await cloudinary.uploader.upload(backCnicImage, {
      folder: 'dealer_cnic_documents',
    });

    // 6. Save Dealer with Cloudinary Image URLs in Database
    const newDealer = await db
      .insert(dealerUsers)
      .values({
        name,
        email,
        cnicNumber,
        phoneNumber,
        companyName,
        companyAddress,
        frontCnicImage: frontUpload.secure_url,
        backCnicImage: backUpload.secure_url,
        status: 'pending',
      })
      .returning();

    return NextResponse.json(
      {
        message: 'Your dealer application has been successfully submitted!',
        data: newDealer[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error. Image upload failed.' },
      { status: 500 }
    );
  }
}

// GET: CHECK APPLICATION STATUS (By CNIC, Email, or Phone)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get('query')?.trim();

    if (!identifier) {
      return NextResponse.json(
        { error: 'Please provide a CNIC Number, Email Address, or Phone Number.' },
        { status: 400 }
      );
    }

    const dealer = await db
      .select()
      .from(dealerUsers)
      .where(
        or(
          eq(dealerUsers.cnicNumber, identifier),
          eq(dealerUsers.email, identifier),
          eq(dealerUsers.phoneNumber, identifier)
        )
      )
      .limit(1);

    if (dealer.length === 0) {
      return NextResponse.json(
        { error: 'No application record found for the provided details.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: dealer[0] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Server error. Unable to fetch application status.' },
      { status: 500 }
    );
  }
}