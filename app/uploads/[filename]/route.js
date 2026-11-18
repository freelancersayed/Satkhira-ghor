import { NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';

export const dynamic = 'force-dynamic';

const MIME_MAP = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jfif: 'image/jpeg',
  pjpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  heic: 'image/heic',
  heif: 'image/heif',
};

export async function GET(request, context) {
  try {
    const params = await Promise.resolve(context?.params);
    const filename = params?.filename;
    if (!filename) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Security: Prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const ext = sanitizedFilename.split('.').pop()?.toLowerCase() || '';
    const contentType = MIME_MAP[ext] || 'image/jpeg';

    // 1. Try local disk first (for local dev or if file exists)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const filePath = path.join(uploadsDir, sanitizedFilename);

      if (existsSync(filePath)) {
        const fileBuffer = await readFile(filePath);
        const fileStat = await stat(filePath);

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Length': fileStat.size.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      }
    } catch (diskErr) {
      // Fall through to database
    }

    // 2. Fallback to MongoDB Media collection (essential for Vercel / serverless deployments)
    await dbConnect();
    const media = await Media.findOne({ filename: sanitizedFilename });

    if (media && media.data) {
      return new NextResponse(media.data, {
        status: 200,
        headers: {
          'Content-Type': media.contentType || contentType,
          'Content-Length': media.size ? media.size.toString() : media.data.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    return new NextResponse('File not found', { status: 404 });
  } catch (error) {
    console.error('Error serving upload:', error);
    return new NextResponse('Error serving file', { status: 500 });
  }
}
