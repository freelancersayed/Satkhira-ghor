import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';

export const dynamic = 'force-dynamic';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const useCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

export async function POST(request) {
  try {
    // Authenticated users (admin or customer) can upload images
    const authCheck = await requireAuth(request);
    if (authCheck.error) {
      return NextResponse.json({ message: authCheck.error }, { status: authCheck.status });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'কোনো ছবি বা ফাইল নির্বাচন করা হয়নি' }, { status: 400 });
    }

    // Validate type (support standard images, camera shots, and phone gallery formats: jpg, png, webp, avif, jfif, svg, etc.)
    const isImage =
      (file.type && file.type.startsWith('image/')) ||
      /\.(jpe?g|png|webp|gif|avif|heic|heif|bmp|jfif|svg)$/i.test(file.name || '');

    if (!isImage) {
      return NextResponse.json(
        { message: 'শুধুমাত্র ছবি (JPG, PNG, WEBP, AVIF, JFIF ইত্যাদি) ফাইল সমর্থনযোগ্য' },
        { status: 400 }
      );
    }

    // Max 25MB for modern high-resolution smartphone camera photos and gallery uploads
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'ছবির সাইজ সর্বোচ্চ ২৫MB হতে পারবে' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ── 1. TRY CLOUDINARY UPLOAD (If configured) ──────────────────────
    if (useCloudinary) {
      try {
        const uploadResult = await Promise.race([
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'satkhira-ghor',
                resource_type: 'image',
                transformation: [{ quality: 'auto', fetch_format: 'auto' }],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(buffer);
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Cloudinary upload timeout (3.5s)')), 3500)
          ),
        ]);

        return NextResponse.json({
          success: true,
          url: uploadResult.secure_url,
          message: 'ছবি সফলভাবে ক্লাউডে আপলোড হয়েছে!',
        });
      } catch (cloudErr) {
        console.warn('Cloudinary upload warning (falling back to local):', cloudErr.message || cloudErr);
        // Automatically fall through to local fallback below
      }
    }

    // ── 2. DURABLE UPLOAD (Local Disk + MongoDB Media Collection) ──────
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/pjpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/bmp': 'bmp',
      'image/x-ms-bmp': 'bmp',
      'image/heic': 'heic',
      'image/heif': 'heif',
    };

    let rawExt = file.name?.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
    // Normalize JFIF and JPEG to standard JPG for universal browser and Next.js compatibility
    if (rawExt === 'jfif' || rawExt === 'jpeg') rawExt = 'jpg';
    const ext = rawExt.replace(/[^a-z0-9]/g, '') || mimeToExt[file.type] || 'jpg';
    const filename = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const contentType = file.type || `image/${ext}`;

    // A. Write to local disk if writable
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
    } catch (diskErr) {
      console.warn('Local disk write skipped (read-only filesystem):', diskErr.message);
    }

    // B. Always persist to MongoDB Media collection for durability across Vercel serverless instances
    try {
      await dbConnect();
      await Media.findOneAndUpdate(
        { filename },
        {
          filename,
          data: buffer,
          contentType,
          size: buffer.length,
        },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.warn('Could not save to MongoDB Media:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      message: 'ছবি সফলভাবে আপলোড হয়েছে',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'ছবি আপলোড ব্যর্থ হয়েছে: ' + (error.message || 'অজানা সমস্যা') },
      { status: 500 }
    );
  }
}
