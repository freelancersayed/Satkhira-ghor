import { NextResponse } from 'next/server';
import { getMediaBuffer } from '@/lib/mediaService';

export const dynamic = 'force-dynamic';

export async function GET(request, context) {
  try {
    const params = await Promise.resolve(context?.params);
    const filename = params?.filename;
    if (!filename) {
      return new NextResponse('Filename missing', { status: 400 });
    }

    // Support ETag / If-None-Match for 304 Not Modified
    const clientEtag = request.headers.get('if-none-match');
    const etag = `"${filename}"`;
    if (clientEtag && clientEtag === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
          ETag: etag,
        },
      });
    }

    const media = await getMediaBuffer(filename);
    if (!media) {
      return new NextResponse('File not found', { status: 404 });
    }

    return new NextResponse(media.buffer, {
      status: 200,
      headers: {
        'Content-Type': media.contentType,
        'Content-Length': media.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': etag,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error serving upload:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
