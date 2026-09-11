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

// Helper function to extract Cloudinary public ID from URL
function getPublicIdFromUrl(url: string): string | null {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    let startIndex = uploadIndex + 1;
    if (parts[startIndex]?.startsWith('v')) {
      startIndex++;
    }

    const publicIdWithExt = parts.slice(startIndex).join('/');
    const lastDotIndex = publicIdWithExt.lastIndexOf('.');
    return lastDotIndex !== -1 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;
  } catch (error) {
    return null;
  }
}

// Property Update / Edit ya Status change karne ke liye (PATCH)
// Property Update / Edit ya Status change karne ke liye (PATCH)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 1. Pehle database se purani property fetch karein taake purani images ka pata chal sake
    const existingProperty = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    const updateData: any = {};

    if (body.status !== undefined) updateData.status = body.status;
    if (body.property_title !== undefined) {
      updateData.property_title = body.property_title;
      updateData.slug = body.property_title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
    if (body.price !== undefined) {
      updateData.price = Number(String(body.price).replace(/,/g, '')) || 0;
    }
    if (body.location !== undefined) updateData.location = body.location;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tag !== undefined) updateData.tag = body.tag;
    if (body.beds !== undefined) updateData.beds = Number(body.beds);
    if (body.baths !== undefined) updateData.baths = Number(body.baths);
    if (body.garages !== undefined) updateData.garages = Number(body.garages);

    // 2. Agar user ne naya images/album ya single image bheja hai, toh purani Cloudinary images delete karein
    if ((body.images !== undefined || body.image !== undefined) && existingProperty.length > 0) {
      const prop = existingProperty[0];

      // Agar pehle se album mojood tha
      if (prop.images) {
        try {
          const oldImgs = JSON.parse(prop.images);
          const newImgs = body.images || [];
          
          // Jo images purane album mein thin lekin naye mein nahi hain, unhein delete kar dein
          for (const oldUrl of oldImgs) {
            if (!newImgs.includes(oldUrl)) {
              const publicId = getPublicIdFromUrl(oldUrl);
              if (publicId) await cloudinary.uploader.destroy(publicId);
            }
          }
        } catch {
          // Fallback agar parse na ho
          if (prop.image && prop.image !== body.image) {
            const publicId = getPublicIdFromUrl(prop.image);
            if (publicId) await cloudinary.uploader.destroy(publicId);
          }
        }
      } else if (prop.image && body.image && prop.image !== body.image) {
        // Agar sirf single image thi aur change ho gayi hai
        const publicId = getPublicIdFromUrl(prop.image);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    if (body.image !== undefined) updateData.image = body.image;
    if (body.images !== undefined) {
      updateData.images = JSON.stringify(body.images);
    }

    await db
      .update(properties)
      .set(updateData)
      .where(eq(properties.id, id));

    return NextResponse.json({ success: true, message: 'Property updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
// Property delete karne ke liye (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingProperty = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    if (existingProperty.length > 0) {
      const prop = existingProperty[0];
      // Agar album images mojood hain toh unhein Cloudinary se delete karna
      if (prop.images) {
        try {
          const imgs = JSON.parse(prop.images);
          for (const imgUrl of imgs) {
            const publicId = getPublicIdFromUrl(imgUrl);
            if (publicId) await cloudinary.uploader.destroy(publicId);
          }
        } catch {
          if (prop.image) {
            const publicId = getPublicIdFromUrl(prop.image);
            if (publicId) await cloudinary.uploader.destroy(publicId);
          }
        }
      } else if (prop.image) {
        const publicId = getPublicIdFromUrl(prop.image);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    await db
      .delete(properties)
      .where(eq(properties.id, id));

    return NextResponse.json({ success: true, message: 'Property deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}