import { NextResponse } from 'next/server';
import { db } from '@/db';
import { properties } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

// 1. Fetch All Properties (GET)
export async function GET() {
  try {
    const data = await db.select().from(properties);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json(
      { message: 'Data fetch karne mein masla hua' },
      { status: 500 }
    );
  }
}

// 2. Create Property with Binary Image (POST)
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
  const userId = (formData.get('userId') as string) || '1';
    // 1. Pehle ye sari values extract karein
    const property_title = (formData.get('property_title') as string) || 'Untitled Property';
   const rawPrice = (formData.get('price') as string) || '0';
const price = Number(rawPrice.replace(/,/g, '')) || 0;
    const location = (formData.get('location') as string) || 'Unspecified Location';
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

    if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');

      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, fileName), buffer);

      imagePath = `/uploads/${fileName}`;
    }

    const newProperty = await db
      .insert(properties)
      .values({
        id: crypto.randomUUID(),
        userId,
        property_title,
        slug, // <--- ab yahan error nahi aayega kyunki property_title pehle declare ho chuka hai
        price,
        location,
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
    console.error('Database Error:', error);
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