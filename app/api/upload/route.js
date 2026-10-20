import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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

    // Validate type (support standard images, camera shots, and phone gallery formats)
    const isImage =
      (file.type && file.type.startsWith('image/')) ||
      /\.(jpe?g|png|webp|gif|avif|heic|heif|bmp|jfif)$/i.test(file.name || '');

    if (!isImage) {
      return NextResponse.json(
        { message: 'শুধুমাত্র ছবি (JPG, PNG, WEBP, GIF ইত্যাদি) ফাইল সমর্থনযোগ্য' },
        { status: 400 }
      );
    }

    // Max 10MB for smartphone camera photos
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'ছবির সাইজ সর্বোচ্চ ১০MB হতে পারবে' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ── 1. TRY CLOUDINARY UPLOAD (If configured) ──────────────────────
    if (useCloudinary) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
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
        });

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

    // ── 2. LOCAL UPLOAD FALLBACK (Local Development / Computer) ─────────
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const rawExt = (file.name?.split('.').pop() || 'jpg').toLowerCase();
      const ext = rawExt.replace(/[^a-z0-9]/g, '') || 'jpg';
      const filename = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
        message: 'ছবি সফলভাবে লোকালে সেভ হয়েছে',
      });
    } catch (fsErr) {
      // If filesystem is read-only (e.g. Vercel without Cloudinary configured)
      // Provide Base64 data URI fallback for images
      if (file.size <= 3 * 1024 * 1024) {
        const mime = file.type || 'image/jpeg';
        const base64Data = `data:${mime};base64,${buffer.toString('base64')}`;
        return NextResponse.json({
          success: true,
          url: base64Data,
          message: 'ছবি আপলোড হয়েছে (Data URI)',
        });
      }

      throw new Error(
        'ছবি আপলোড ব্যর্থ হয়েছে। দয়া করে সঠিক Cloudinary তথ্য যোগ করুন।'
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'ছবি আপলোড ব্যর্থ হয়েছে: ' + (error.message || 'অজানা সমস্যা') },
      { status: 500 }
    );
  }
}
