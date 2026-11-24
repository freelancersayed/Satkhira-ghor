import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';

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

// Global in-memory LRU cache to avoid repeated disk reads or MongoDB queries
if (!global._mediaBufferCache) {
  global._mediaBufferCache = new Map();
}
const mediaCache = global._mediaBufferCache;
const MAX_CACHE_ITEMS = 120;

export function getMimeType(filename) {
  const ext = filename?.split('.').pop()?.toLowerCase() || '';
  return MIME_MAP[ext] || 'application/octet-stream';
}

export async function getMediaBuffer(filename) {
  if (!filename) return null;
  const sanitizedFilename = path.basename(filename);

  // 1. In-Memory Cache (0ms latency)
  if (mediaCache.has(sanitizedFilename)) {
    const cached = mediaCache.get(sanitizedFilename);
    mediaCache.delete(sanitizedFilename);
    mediaCache.set(sanitizedFilename, cached);
    return cached;
  }

  const contentType = getMimeType(sanitizedFilename);

  // 2. Local Disk (fast disk read if file exists)
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, sanitizedFilename);
    if (existsSync(filePath)) {
      const buffer = await readFile(filePath);
      const entry = {
        buffer,
        contentType,
        size: buffer.length,
      };
      if (mediaCache.size >= MAX_CACHE_ITEMS) {
        const oldestKey = mediaCache.keys().next().value;
        mediaCache.delete(oldestKey);
      }
      mediaCache.set(sanitizedFilename, entry);
      return entry;
    }
  } catch (e) {
    // Disk read failed, fallback to database
  }

  // 3. Database lookup (MongoDB Atlas Media collection)
  try {
    await dbConnect();
    const media = await Media.findOne({ filename: sanitizedFilename }).lean();
    if (media && media.data) {
      const rawBuf = media.data.buffer || media.data;
      const buffer = Buffer.isBuffer(rawBuf) ? rawBuf : Buffer.from(rawBuf);
      const entry = {
        buffer,
        contentType: media.contentType || contentType,
        size: media.size || buffer.length,
      };

      // Asynchronously attempt to write to public/uploads if directory exists to speed up future local reads
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (existsSync(uploadsDir)) {
          const filePath = path.join(uploadsDir, sanitizedFilename);
          writeFile(filePath, buffer).catch(() => {});
        }
      } catch (e) {}

      if (mediaCache.size >= MAX_CACHE_ITEMS) {
        const oldestKey = mediaCache.keys().next().value;
        mediaCache.delete(oldestKey);
      }
      mediaCache.set(sanitizedFilename, entry);
      return entry;
    }
  } catch (dbErr) {
    console.error('Error fetching media from DB:', dbErr.message);
  }

  return null;
}
