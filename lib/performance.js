import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// ── In-Memory Fast Cache ─────────────────────────────────────
// Holds API query results in RAM for lightning-fast responses (1ms-3ms)
// Automatically expires after TTL (default 30 seconds) and supports instant invalidation
const memoryCache = new Map();

export function getCachedData(key) {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return item.data;
}

export function setCachedData(key, data, ttlSeconds = 30) {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function invalidateCache(prefix = '') {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

// ── Base64 Guard & Auto-Saver ────────────────────────────────
// If any Base64 image slips into API requests, this converts it into
// a physical static file in public/uploads and returns the clean URL.
// This prevents database bloat and preserves 100% blazing speed.
export async function sanitizeBase64(value, prefix = 'img') {
  if (!value) return value;

  if (typeof value === 'string') {
    if (value.startsWith('data:image/')) {
      try {
        const mimeMatch = value.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/s);
        if (mimeMatch) {
          let ext = mimeMatch[1].toLowerCase();
          if (ext === 'jpeg' || ext === 'jfif') ext = 'jpg';
          if (ext === 'svg+xml') ext = 'svg';

          const buffer = Buffer.from(mimeMatch[2], 'base64');
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
          }

          const filename = `auto_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
          const filePath = path.join(uploadDir, filename);
          await writeFile(filePath, buffer);

          return `/uploads/${filename}`;
        }
      } catch (err) {
        console.warn('Failed to convert base64 to file:', err.message);
      }
    }
    return value;
  }

  if (Array.isArray(value)) {
    const cleaned = [];
    for (let i = 0; i < value.length; i++) {
      cleaned.push(await sanitizeBase64(value[i], `${prefix}_${i}`));
    }
    return cleaned;
  }

  if (typeof value === 'object' && value !== null) {
    const cleanedObj = {};
    for (const [k, v] of Object.entries(value)) {
      cleanedObj[k] = await sanitizeBase64(v, `${prefix}_${k}`);
    }
    return cleanedObj;
  }

  return value;
}
