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

// 2. Create Property with JSON & Multiple Images Array (POST)
export async function POST(req: Request) {
  try {
    // Frontend se JSON body aa rahi hai
    const body = await req.json();
    
    const userId = body.userId || '1';
    const property_title = body.property_title || 'Untitled Property';
    const rawPrice = body.price ? String(body.price) : '0';
    const price = Number(rawPrice.replace(/,/g, '')) || 0;
    const location = body.location || 'Unspecified Location';
    const country = body.country || 'Pakistan';
    const currency = body.currency || 'PKR';
    const category = body.category || 'General';
    const status = body.status || 'Active';
    const tag = body.tag || 'For Sale';
    const beds = Number(body.beds) || 0;
    const baths = Number(body.baths) || 0;
    const garages = Number(body.garages) || 0;
    
    // Multiple images ya single image array
    const imageInput = body.image || '';
    const imagesArray: string[] = Array.isArray(body.images) ? body.images : (imageInput ? [imageInput] : []);

    // Slug generation
    const slug = property_title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const primaryImage = imagesArray.length > 0 ? imagesArray[0] : '/images/properties/default.jpg';

    const newProperty = await db
      .insert(properties)
      .values({
        id: crypto.randomUUID(),
        userId,
        property_title,
        slug,
        price,
        location,
        country,
        currency,
        category,
        status,
        tag,
        beds,
        baths,
        garages,
        image: primaryImage,
        // Agar aapke Drizzle schema mein 'images' column mojood hai toh usay JSON ya stringify kar ke save karein:
        images: JSON.stringify(imagesArray), 
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