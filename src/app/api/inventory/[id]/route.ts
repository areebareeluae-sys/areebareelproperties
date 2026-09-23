import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventory } from '@/db/schema';
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

// Inventory Update / Edit ya Status change karne ke liye (PATCH)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 1. Pehle database se purani inventory item fetch karein taake purani images ka pata chal sake
    const existingInventory = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, id))
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
    if (body.sqrft !== undefined) updateData.sqrft = Number(body.sqrft);
    if (body.garages !== undefined) updateData.garages = Number(body.garages);

    // 2. Agar user ne naya images/album ya single image bheja hai, toh jo images remove ho chuki hain unhein Cloudinary se delete karein
    if (existingInventory.length > 0) {
      const item = existingInventory[0];

      // Handle Album Images Cleanup
      if (body.images !== undefined) {
        try {
          const oldImgs = item.images ? JSON.parse(item.images) : [];
          const newImgs = Array.isArray(body.images) ? body.images : [];

          // Jo images purane album mein thin lekin naye mein nahi hain, unhein Cloudinary se delete karein
          for (const oldUrl of oldImgs) {
            if (!newImgs.includes(oldUrl)) {
              const publicId = getPublicIdFromUrl(oldUrl);
              if (publicId) {
                await cloudinary.uploader.destroy(publicId);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing old images for cleanup:', e);
        }
        updateData.images = JSON.stringify(body.images);
      }

      // Handle Single Main Image Cleanup
      if (body.image !== undefined && item.image && item.image !== body.image) {
        const publicId = getPublicIdFromUrl(item.image);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
        updateData.image = body.image;
      } else if (body.image !== undefined) {
        updateData.image = body.image;
      }
    }

    // Database update query
    await db
      .update(inventory)
      .set(updateData)
      .where(eq(inventory.id, id));

    return NextResponse.json({ success: true, message: 'Inventory updated successfully and old images cleaned up' }, { status: 200 });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// Inventory delete karne ke liye (DELETE) - Saari associated images Cloudinary se delete ho jayengi
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingInventory = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, id))
      .limit(1);

    if (existingInventory.length > 0) {
      const item = existingInventory[0];

      // 1. Delete Album images from Cloudinary if they exist
      if (item.images) {
        try {
          const imgs = JSON.parse(item.images);
          if (Array.isArray(imgs)) {
            for (const imgUrl of imgs) {
              const publicId = getPublicIdFromUrl(imgUrl);
              if (publicId) {
                await cloudinary.uploader.destroy(publicId);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing images JSON during delete:', e);
        }
      }

      // 2. Delete single main image from Cloudinary if it exists
      if (item.image) {
        const publicId = getPublicIdFromUrl(item.image);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    // Finally delete record from database
    await db
      .delete(inventory)
      .where(eq(inventory.id, id));

    return NextResponse.json({ success: true, message: 'Inventory and its images deleted successfully from Cloudinary' }, { status: 200 });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}