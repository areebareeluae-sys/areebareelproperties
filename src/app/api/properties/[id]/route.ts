import { NextResponse } from 'next/server';
import { db } from '@/db';
import { properties } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

// Status update karne ya Edit Property ke liye (PATCH)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check karein ke request JSON hai ya FormData
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
    
    // Agar AddPropertyModal se FormData aaye (Edit form submit hone par, image ke sath)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const property_title = formData.get('property_title') as string;
      const price = Number(formData.get('price'));
      const location = formData.get('location') as string;
      const country = (formData.get('country') as string) || 'Pakistan';
      const currency = (formData.get('currency') as string) || 'PKR';
      const category = (formData.get('category') as string);
      const status = formData.get('status') as string;
      const tag = formData.get('tag') as string;
      const beds = Number(formData.get('beds'));
      const baths = Number(formData.get('baths'));
      const garages = Number(formData.get('garages'));
      
      const imageFile = formData.get('image');

      // Update data object with country and currency
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
        // 1. Pehle database se purani property ki details fetch karein taake purani image ka path mil sake
        const existingProperty = await db
          .select()
          .from(properties)
          .where(eq(properties.id, id))
          .limit(1);

        // 2. Agar purani image mojood thi, toh usay server se delete karein
        if (existingProperty.length > 0 && existingProperty[0].image) {
          const oldImagePath = existingProperty[0].image; // Maslan: /uploads/174...jpg
          // Sirf wahi images delete karein jo local uploads folder mein hain
          if (oldImagePath.startsWith('/uploads/')) {
            const fullOldPath = path.join(process.cwd(), 'public', oldImagePath);
            try {
              await unlink(fullOldPath); // Server se purani file delete ho jayegi
            } catch (err) {
              console.log('Purani image delete karne mein error ya file mojood nahi thi:', err);
            }
          }
        }

        // 3. Ab nayi image ko save karein
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        
        try {
          await writeFile(path.join(uploadDir, filename), buffer);
          updateData.image = `/uploads/${filename}`;
        } catch (err) {
          console.error('Nayi image save karne ka error:', err);
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

// Property delete karne ke liye (DELETE) - Jab poori property delete ho tab bhi image server se hat jaye
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Property delete karne se pehle check karein ke uski koi image thi ya nahi
    const existingProperty = await db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    if (existingProperty.length > 0 && existingProperty[0].image) {
      const oldImagePath = existingProperty[0].image;
      if (oldImagePath.startsWith('/uploads/')) {
        const fullOldPath = path.join(process.cwd(), 'public', oldImagePath);
        try {
          await unlink(fullOldPath); // Poori property delete hone par image bhi server se delete
        } catch (err) {
          console.log('Image delete error:', err);
        }
      }
    }

    // 2. Database se property record delete karein
    await db
      .delete(properties)
      .where(eq(properties.id, id));

    return NextResponse.json({ success: true, message: 'Property deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}