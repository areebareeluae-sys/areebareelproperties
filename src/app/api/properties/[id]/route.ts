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
    
    // Naye fields ki mapping
    if (body.description !== undefined) updateData.description = body.description;
    if (body.mini_description !== undefined) updateData.mini_description = body.mini_description;
    if (body.pin_location !== undefined) updateData.pin_location = body.pin_location;
    if (body.agent_name !== undefined) updateData.agent_name = body.agent_name;
    if (body.agent_number !== undefined) updateData.agent_number = body.agent_number;

    if (body.property_type !== undefined) {
      updateData.property_type = body.property_type;
      // Agar Commercial ho jaye toh beds/baths/garages ko automatically 0 kar dein
      if (body.property_type === 'Commercial') {
        updateData.beds = 0;
        updateData.baths = 0;
        updateData.garages = 0;
      }
    }
    if (body.area_size !== undefined) updateData.area_size = body.area_size;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.area !== undefined) updateData.area = body.area;

    if (body.location !== undefined) updateData.location = body.location;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tag !== undefined) updateData.tag = body.tag;

    // Beds, baths, garages sirf tab update hon jab Commercial na ho ya explicitly bheje gaye hon
    if (body.property_type !== 'Commercial') {
      if (body.beds !== undefined) updateData.beds = Number(body.beds);
      if (body.baths !== undefined) updateData.baths = Number(body.baths);
      if (body.garages !== undefined) updateData.garages = Number(body.garages);
    }

    // 2. Agar user ne naya images/album ya single image bheja hai, toh purani Cloudinary images delete karein
    if ((body.images !== undefined || body.image !== undefined) && existingProperty.length > 0) {
      const prop = existingProperty[0];

      if (prop.images) {
        try {
          const oldImgs = JSON.parse(prop.images);
          const newImgs = body.images || [];
          
          for (const oldUrl of oldImgs) {
            if (!newImgs.includes(oldUrl)) {
              const publicId = getPublicIdFromUrl(oldUrl);
              if (publicId) await cloudinary.uploader.destroy(publicId);
            }
          }
        } catch {
          if (prop.image && prop.image !== body.image) {
            const publicId = getPublicIdFromUrl(prop.image);
            if (publicId) await cloudinary.uploader.destroy(publicId);
          }
        }
      } else if (prop.image && body.image && prop.image !== body.image) {
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