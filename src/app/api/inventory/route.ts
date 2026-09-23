import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventory } from '@/db/schema';
import { eq } from 'drizzle-orm'; // <-- Yeh import zaroori hai

// --- 1. GET: Fetch All Inventory (Optional userId filter ke sath) ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let allInventory;

    if (userId) {
      // Agar userId pass ki jaye toh sirf uski inventory aayegi
      allInventory = await db
        .select()
        .from(inventory)
        .where(eq(inventory.userId, userId));
    } else {
      // Agar userId na ho toh database ki SAARI inventory fetch ho kar aayegi
      allInventory = await db
        .select()
        .from(inventory);
    }

    // Har inventory item ke 'images' string ko wapas array mein parse karna
    const formattedInventory = allInventory.map((item) => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : [item.image],
    }));

    return NextResponse.json({ success: true, data: formattedInventory }, { status: 200 });
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// --- 2. POST: Add New Inventory Item ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      property_title,
      location,
      country,
      currency,
      category,
      status,
      slug,
      tag,
      price,
      beds,
      baths,
      sqrft,
      garages,
      image,
      images,
    } = body;

    // Basic validation
    if (!userId || !property_title || !location || !slug) {
      return NextResponse.json(
        { success: false, message: 'Required fields are missing!' },
        { status: 400 }
      );
    }

    const newId = crypto.randomUUID();

    await db.insert(inventory).values({
      id: newId,
      userId,
      property_title,
      location,
      country: country || 'Pakistan',
      currency: currency || 'PKR',
      category: category || 'general',
      status: status || 'Active',
      slug,
      tag: tag || 'For Sale',
      price: price ? Number(price) : 0,
      beds: beds ? Number(beds) : 0,
      baths: baths ? Number(baths) : 0,
      sqrft: sqrft ? Number(sqrft) : 0,
      garages: garages ? Number(garages) : 0,
      image: image || null,
      images: images ? JSON.stringify(images) : null,
    });

    return NextResponse.json(
      { success: true, message: 'Inventory added successfully!', id: newId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Insert Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}