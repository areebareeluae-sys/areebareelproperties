import { db } from "@/db";
import { adBanners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET: Active Banners fetch karne ke liye
export async function GET() {
  try {
    const banners = await db
      .select()
      .from(adBanners)
      .where(eq(adBanners.status, 'Active'));

    return NextResponse.json(banners, { status: 200 });
  } catch (error) {
    console.error('Banners Fetch Error:', error);
    return NextResponse.json({ message: 'Error fetching banners' }, { status: 500 });
  }
}

// POST: Cloudinary par upload karke DB mein URL aur Public ID save karna
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ message: "Image file is required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "ad_banners" },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      ).end(buffer);
    });

    // Database mein image url ke sath public_id bhi save kar rahe hain
    await db.insert(adBanners).values({
      image: uploadResult.secure_url,
      public_id: uploadResult.public_id, // <-- Yeh add kiya gaya hai
      status: "Active",
    });

    return NextResponse.json({ message: "Banner uploaded successfully", url: uploadResult.secure_url }, { status: 201 });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Database aur Cloudinary dono se banner/image delete karna
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Banner ID is required" }, { status: 400 });
    }

    // 1. Pehle database se banner find karein taake uska public_id mil sake
    const bannerRecord = await db
      .select()
      .from(adBanners)
      .where(eq(adBanners.id, Number(id)))
      .limit(1);

    if (bannerRecord.length === 0) {
      return NextResponse.json({ message: "Banner not found" }, { status: 404 });
    }

    const targetBanner = bannerRecord[0];

    // 2. Cloudinary se image delete karein using public_id
    if (targetBanner.public_id) {
      await cloudinary.uploader.destroy(targetBanner.public_id);
    }

    // 3. Database se record delete karein
    await db.delete(adBanners).where(eq(adBanners.id, Number(id)));

    return NextResponse.json({ message: "Banner deleted successfully from Database and Cloudinary" }, { status: 200 });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}