/**
 * Helper to extract client authentic IP address and Geolocation
 * Handles proxies, Vercel, Cloudflare, nginx headers.
 */

export function extractClientIp(request) {
  if (!request) return '127.0.0.1';

  // 1. Cloudflare connecting IP
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  // 2. x-forwarded-for header (comma separated if multiple proxies)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  // 3. x-real-ip
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  // 4. Fallback
  return '127.0.0.1';
}

/**
 * Fetch or mock IP Geolocation (City, Country, ISP)
 * Queries ip-api.com with fallback to mock data for local / development IPs.
 */
export async function getIpGeoInfo(ip) {
  const isLocalOrPrivate =
    !ip ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip === 'localhost';

  if (isLocalOrPrivate) {
    return {
      ipAddress: ip || '127.0.0.1 (Localhost/Dev)',
      city: 'ঢাকা (Dhaka)',
      country: 'বাংলাদেশ (Bangladesh)',
      isp: 'Local ISP / Broadband Gateway',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 sec timeout

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,isp,query`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        return {
          ipAddress: data.query || ip,
          city: data.city || 'ঢাকা',
          country: data.country || 'বাংলাদেশ',
          isp: data.isp || 'Telecom / Broadband Network',
        };
      }
    }
  } catch (error) {
    // Geo API timeout or network error fallback
    console.warn(`[GeoIP] Lookup failed for ${ip}:`, error.message);
  }

  // Graceful fallback
  return {
    ipAddress: ip,
    city: 'ঢাকা (Dhaka Metropolitan)',
    country: 'বাংলাদেশ',
    isp: 'Banglalink / Grameenphone / Grameen CyberNet',
  };
}
