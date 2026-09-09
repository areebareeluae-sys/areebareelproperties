import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Target directory: /public/images/
        const uploadDir = path.join(process.cwd(), 'public', 'images');

        // Ensure folder exists
        await mkdir(uploadDir, { recursive: true });

        // Unique filename prevent overwriting
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const filePath = path.join(uploadDir, filename);

        // Save file physically to public/images
        await writeFile(filePath, buffer);

        // Return public accessible URL path
        const imageUrl = `/images/${filename}`;

        return NextResponse.json({ success: true, imageUrl });
    } catch (error) {
        console.error('Error saving image:', error);
        return NextResponse.json({ error: 'Failed to save image' }, { status: 500 });
    }
}