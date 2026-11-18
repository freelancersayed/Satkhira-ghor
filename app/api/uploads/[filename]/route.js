import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  jfif: 'image/jpeg',
  ico: 'image/x-icon',
};

function getMimeType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

export async function GET(request, context) {
  try {
    const params = await Promise.resolve(context?.params);
    const filename = params?.filename;

    if (!filename) {
      return new NextResponse('Filename missing', { status: 400 });
    }

    // 1. Try reading from local disk if it exists (instant disk read)
    try {
      const diskPath = path.join(process.cwd(), 'public', 'uploads', filename);
      if (existsSync(diskPath)) {
        const fileBuffer = await readFile(diskPath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': getMimeType(filename),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    } catch (diskErr) {
      // Fall through to database lookup
    }

    // 2. Fall back to MongoDB Media collection (for Vercel serverless / ephemeral storage)
    await dbConnect();
    const media = await Media.findOne({ filename });

    if (!media || !media.data) {
      return new NextResponse('Image not found', { status: 404 });
    }

    return new NextResponse(media.data, {
      status: 200,
      headers: {
        'Content-Type': media.contentType || getMimeType(filename),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Error serving image:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
