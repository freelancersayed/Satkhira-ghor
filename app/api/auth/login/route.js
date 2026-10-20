import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { message: 'মোবাইল/ইমেইল এবং পাসওয়ার্ড আবশ্যক' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const cleanIdentifier = identifier.trim();

    // Find by phone or email
    const user = await User.findOne({
      $or: [
        { phone: cleanIdentifier },
        { email: cleanIdentifier.toLowerCase() },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { message: 'মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'মোবাইল নম্বর/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়' },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: 'সফলভাবে লগইন হয়েছে',
      user: {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        address: user.address,
        city: user.city,
      },
    });

    // Set secure HTTP-Only Cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'লগইন সম্পন্ন করা যায়নি: ' + error.message },
      { status: 500 }
    );
  }
}
