import { NextResponse } from 'next/server';
import { db } from '@/db';
import { properties } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

// 1. Fetch All Properties (GET)
export async function GET() {
  try {
    // Sirf wahi properties fetch hongi jinka status 'Active' ho
    const data = await db
      .select()
      .from(properties)
      .where(eq(properties.status, 'Active'));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json(
      { message: 'Data fetch karne mein masla hua' },
      { status: 500 }
    );
  }
}

// 2. Create Property with Cloudinary Image Upload (POST)
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const userId = (formData.get('userId') as string) || '1';
    
    // 1. Pehle ye sari values extract karein (including country & currency)
    const property_title = (formData.get('property_title') as string) || 'Untitled Property';
    const rawPrice = (formData.get('price') as string) || '0';
    const price = Number(rawPrice.replace(/,/g, '')) || 0;
    const location = (formData.get('location') as string) || 'Unspecified Location';
    const country = (formData.get('country') as string) || 'Pakistan';
    const currency = (formData.get('currency') as string) || 'PKR';
    const category = (formData.get('category') as string) || 'General';
    const status = (formData.get('status') as string) || 'Active';
    const tag = (formData.get('tag') as string) || 'For Sale';
    const beds = Number(formData.get('beds')) || 0;
    const baths = Number(formData.get('baths')) || 0;
    const garages = Number(formData.get('garages')) || 0;
    const imageFile = formData.get('image') as File | null;

    // 2. Phir property_title ke baad slug banayein
    const slug = property_title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let imagePath = '/images/properties/default.jpg';

    // 3. Local filesystem write ke bajaye Cloudinary par upload karein
    if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      imagePath = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'chiron_properties' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url || '/images/properties/default.jpg');
          }
        );
        uploadStream.end(buffer);
      });
    }

    const newProperty = await db
      .insert(properties)
      .values({
        id: crypto.randomUUID(),
        userId,
        property_title,
        slug,
        price,
        location,
        country,    // Database mein country save hogi
        currency,   // Database mein currency (PKR/AED) save hogi
        category,
        status,
        tag,
        beds,
        baths,
        garages,
        image: imagePath,
        createdAt: new Date().toISOString(),
      })
      .returning();

    const result = Array.isArray(newProperty) ? newProperty[0] : newProperty;

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('Database/Cloudinary Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to insert property' },
      { status: 500 }
    );
  }
}

// 3. Delete Property (DELETE)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Property ID zaruri hai' },
        { status: 400 }
      );
    }

    const deletedRecord = await db
      .delete(properties)
      .where(eq(properties.id, id))
      .returning();

    if (Array.isArray(deletedRecord) && deletedRecord.length === 0) {
      return NextResponse.json(
        { message: 'Property nahi mili' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Property delete ho gayi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json(
      { message: 'Property delete karne mein masla hua' },
      { status: 500 }
    );
  }
}