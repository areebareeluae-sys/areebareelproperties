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
    // Example URL: https://res.cloudinary.com/y556pcib/image/upload/v1789027488/chiron_properties/qqfkqvki8rxamtj6sngd.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    // Skip 'upload' and optional version (e.g., 'v1789027488')
    let startIndex = uploadIndex + 1;
    if (parts[startIndex]?.startsWith('v')) {
      startIndex++;
    }

    // Join the remaining parts and remove extension
    const publicIdWithExt = parts.slice(startIndex).join('/');
    const lastDotIndex = publicIdWithExt.lastIndexOf('.');
    return lastDotIndex !== -1 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;
  } catch (error) {
    return null;
  }
}

// Status update karne ya Edit Property ke liye (PATCH)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { status } = body;

      if (status) {
        await db
          .update(properties)
          .set({ status })
          .where(eq(properties.id, id));

        return NextResponse.json({ success: true, message: 'Status updated successfully' }, { status: 200 });
      }
    } 
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const property_title = formData.get('property_title') as string;
      const price = Number(formData.get('price'));
      const location = formData.get('location') as string;
      const country = (formData.get('country') as string) || 'Pakistan';
      const currency = (formData.get('currency') as string) || 'PKR';
      const category = (formData.get('category') as string);
      const status = formData.get('status') as string;
      const tag = (formData.get('tag') as string);
      const beds = Number(formData.get('beds'));
      const baths = Number(formData.get('baths'));
      const garages = Number(formData.get('garages'));
      
      const imageFile = formData.get('image');

      const updateData: any = {
        property_title,
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
      };

      // Agar user ne nayi image select ki hai
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        // 1. Pehle database se purani property fetch karein taake purani image ka URL mil sake
        const existingProperty = await db
          .select()
          .from(properties)
          .where(eq(properties.id, id))
          .limit(1);

        if (existingProperty.length > 0 && existingProperty[0].image) {
          const oldImageUrl = existingProperty[0].image;
          const publicId = getPublicIdFromUrl(oldImageUrl);
          
          // 2. Agar Cloudinary ki valid image thi toh usay delete kar dein
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (err) {
              console.error('Purani image Cloudinary se delete karne mein error:', err);
            }
          }
        }

        // 3. Ab nayi image ko Cloudinary par upload karein
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const cloudinaryUrl: string = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'chiron_properties' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result?.secure_url || '');
            }
          );
          uploadStream.end(buffer);
        });

        if (cloudinaryUrl) {
          updateData.image = cloudinaryUrl;
        }
      }

      await db
        .update(properties)
        .set(updateData)
        .where(eq(properties.id, id));

      return NextResponse.json({ success: true, message: 'Property updated successfully' }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });

  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

// Property delete karne ke liye (DELETE) - Poori property delete hone par image bhi Cloudinary se remove ho jaye gi
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Delete karne se pehle image ka URL nikal lein
    const existingProperty = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    if (existingProperty.length > 0 && existingProperty[0].image) {
      const publicId = getPublicIdFromUrl(existingProperty[0].image);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Cloudinary image delete error:', err);
        }
      }
    }

    // 2. Database se record delete karein
    await db
      .delete(properties)
      .where(eq(properties.id, id));

    return NextResponse.json({ success: true, message: 'Property deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}