import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'satkhira_ghor_super_secret_jwt_key_2026_bd';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export function signToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Extracts and verifies the current session user from cookies or Authorization header.
 * Works in Next.js Server Components and Route Handlers.
 */
export async function getSessionUser(request = null) {
  let token = null;

  // 1. Try reading from request Authorization header if request is provided
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // 2. If not found, try reading from Next.js cookies
  if (!token) {
    try {
      const cookieStore = cookies();
      const tokenCookie = cookieStore.get('token');
      if (tokenCookie) {
        token = tokenCookie.value;
      }
    } catch (e) {
      // Cookies not accessible in some contexts
    }
  }

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  return decoded;
}

export async function requireAuth(request = null) {
  const user = await getSessionUser(request);
  if (!user) {
    return { error: 'অননুমোদিত অ্যাক্সেস, দয়া করে লগইন করুন', status: 401 };
  }
  return { user };
}

export async function requireAdmin(request = null) {
  const user = await getSessionUser(request);
  if (!user || user.role !== 'admin') {
    return { error: 'অ্যাক্সেস অস্বীকৃত: শুধুমাত্র অ্যাডমিনদের জন্য অনুমোদিত', status: 403 };
  }
  return { user };
}
