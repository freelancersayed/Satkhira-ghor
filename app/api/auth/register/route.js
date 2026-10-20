import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { name, phone, email, password, address, city } = await request.json();

    if (!name || !phone || !password) {
      return NextResponse.json(
        { message: 'নাম, মোবাইল নম্বর এবং পাসওয়ার্ড আবশ্যক' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user with phone already exists
    const existingUser = await User.findOne({ phone: phone.trim() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : '',
      password: hashedPassword,
      role: 'user', // Default role
      address: address || '',
      city: city || '',
    });

    const token = signToken({
      id: newUser._id.toString(),
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json(
      {
        message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে',
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          phone: newUser.phone,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

    // Set HTTP-Only Cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি: ' + error.message },
      { status: 500 }
    );
  }
}
