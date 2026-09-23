import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventory } from '@/db/schema'; // Yahan properties ki jagah inventory schema import kar liya
import { eq } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

// 1. Fetch All Active Inventory (GET)
export async function GET() {
  try {
    const data = await db
      .select()
      .from(inventory) // Table name updated to inventory
      .where(eq(inventory.status, 'Active'));

    // Images ko wapas array mein parse karna taake frontend par masla na ho
    const formattedData = data.map((item) => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : [item.image],
    }));

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json(
      { message: 'Inventory data fetch karne mein masla hua' },
      { status: 500 }
    );
  }
}

// 2. Create Inventory Item with JSON & Multiple Images Array (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const userId = body.userId || '1';
    const property_title = body.property_title || 'Untitled Item';
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
    const sqrft = Number(body.sqrft) || 0;
    
    // Multiple images ya single image array
    const imageInput = body.image || '';
    const imagesArray: string[] = Array.isArray(body.images) ? body.images : (imageInput ? [imageInput] : []);

    // Slug generation
    const slug = property_title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const primaryImage = imagesArray.length > 0 ? imagesArray[0] : '/images/properties/default.jpg';

    const newItem = await db
      .insert(inventory) // Table name updated to inventory
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
        sqrft,
        image: primaryImage,
        images: JSON.stringify(imagesArray), 
        createdAt: new Date().toISOString(),
      })
      .returning();

    const result = Array.isArray(newItem) ? newItem[0] : newItem;
    const formattedResult = {
      ...result,
      images: result.images ? JSON.parse(result.images) : [result.image],
    };

    return NextResponse.json({ success: isNaN(Number(result?.id)) ? true : true, data: formattedResult }, { status: 201 });
  } catch (error) {
    console.error('Database/Cloudinary Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to insert inventory item' },
      { status: 500 }
    );
  }
}

// 3. Delete Inventory Item (DELETE)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Inventory ID zaruri hai' },
        { status: 400 }
      );
    }

    const deletedRecord = await db
      .delete(inventory) // Table name updated to inventory
      .where(eq(inventory.id, id))
      .returning();

    if (Array.isArray(deletedRecord) && deletedRecord.length === 0) {
      return NextResponse.json(
        { message: 'Inventory item nahi mila' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Inventory item delete ho gaya' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json(
      { message: 'Inventory item delete karne mein masla hua' },
      { status: 500 }
    );
  }
}