import { NextResponse } from 'next/server';
import { db } from '@/db';
import { properties } from '@/db/schema';
import { eq, and, gte, lte, like, or } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const property_type = searchParams.get('property_type');
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const area = searchParams.get('area');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const status = searchParams.get('status');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const keyword = searchParams.get('keyword');

    // Conditions array build karna
    const conditions = [];

    if (userId) {
      conditions.push(eq(properties.userId, userId));
    }
    if (property_type) {
      conditions.push(eq(properties.property_type, property_type));
    }
    if (country) {
      conditions.push(eq(properties.country, country));
    }
    if (city) {
      conditions.push(eq(properties.city, city));
    }
    if (area) {
      conditions.push(eq(properties.area, area));
    }
    if (category) {
      conditions.push(eq(properties.category, category));
    }
    if (tag) {
      conditions.push(eq(properties.tag, tag));
    }
    if (status) {
      conditions.push(eq(properties.status, status));
    }
    if (minPrice) {
      conditions.push(gte(properties.price, Number(minPrice)));
    }
    if (maxPrice) {
      conditions.push(lte(properties.price, Number(maxPrice)));
    }
    
    // Keyword search: Title ya Description dono mein match karega
    if (keyword) {
      conditions.push(
        or(
          like(properties.property_title, `%${keyword}%`),
          like(properties.description, `%${keyword}%`)
        )
      );
    }

    // Query execute karna with dynamic conditions
    const allProperties = conditions.length > 0
      ? await db.select().from(properties).where(and(...conditions))
      : await db.select().from(properties);

    // Har property ke 'images' string ko wapas array mein parse karna
    const formattedProperties = allProperties.map((prop) => ({
      ...prop,
      images: prop.images ? JSON.parse(prop.images) : (prop.image ? [prop.image] : []),
    }));

    return NextResponse.json({ success: true, data: formattedProperties }, { status: 200 });
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}