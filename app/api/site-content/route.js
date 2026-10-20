import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Default initial content fallback
export const defaultSiteContent = {
  hero: {
    badgeText: 'সুন্দরবন ও সাতক্ষীরার খাঁটি খাদ্য সম্ভার',
    title: 'প্রকৃতির সেরা উপহার, \nসরাসরি আপনার খাবার টেবিলে',
    description:
      'সাতক্ষীরার গভীর সুন্দরবনের খাঁটি খলসী ফুলের মধু, প্রাচীন বিলোনা পদ্ধতির দেশি গাওয়া ঘি এবং খাঁটি ঘানি ভাঙা সরিষার তেল। ১০০% বিশুদ্ধ ও কেমিক্যালমুক্ত।',
    image:
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800',
    floatingBadge1Title: 'ল্যাব টেস্টে পরীক্ষিত',
    floatingBadge1Sub: 'শূন্য ভেজাল গ্যারান্টি',
    floatingBadge2Title: 'খাঁটি গাওয়া ঘি',
    floatingBadge2Sub: 'দেশি গরুর দুধের ননী',
    topNotice:
      'সুন্দরবনের খাঁটি মধু ও সাতক্ষীরার খাঁটি গাওয়া ঘিয়ে সারাদেশে ফ্রি ক্যাশ অন ডেলিভারি (১৫০০ টাকার অর্ডারে)',
    helpline: '০১৭১২-৩৪৫৬৭৮',
  },
  specialBanner: {
    badgeText: 'সরাসরি মৌয়ালদের থেকে সংগৃহীত',
    title: 'খাঁটি সুন্দরবনের কাঁচা মধু চেখে দেখেছেন কি?',
    description:
      'কোনো হিটিং বা পাস্তুরাইজেশন ছাড়া মৌচাকের অক্ষুণ্ণ এনজাইম ও প্রাকৃতিক পরাগরেণু সহ আমরা আপনাদের হাতে তুলে দিচ্ছি শতভাগ খাঁটি মধু।',
    buttonText: 'খলসী মধু অর্ডার করুন',
    buttonLink: '/products/sundarbans-pure-khalsi-honey',
  },
  categorySection: {
    subtitle: 'ক্যাটাগরি সমূহ',
    title: 'উপকূলের তাজা ও ঐতিহ্যবাহী স্বাদ',
    description: 'প্রতিটি পণ্য নিজস্ব তদারকিতে প্রস্তুত ও শতভাগ খাঁটি হওয়ার নিশ্চয়তা',
  },
  brand: {
    name: 'সাতক্ষীরা ঘর',
    tagline: 'Satkhira Ghor • Pure & Organic',
    logoChar: 'স',
  },
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    await connectToDatabase();

    if (key) {
      const item = await SiteContent.findOne({ key });
      return NextResponse.json({
        data: item ? item.data : defaultSiteContent[key] || {},
      });
    }

    const allItems = await SiteContent.find();
    const result = { ...defaultSiteContent };

    allItems.forEach((doc) => {
      result[doc.key] = { ...result[doc.key], ...doc.data };
    });

    return NextResponse.json({ content: result });
  } catch (error) {
    console.warn('Site content fetch fallback:', error.message);
    return NextResponse.json({ content: defaultSiteContent });
  }
}

export async function PUT(request) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck.error) {
      return NextResponse.json(
        { message: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { key, data } = await request.json();

    if (!key || !data) {
      return NextResponse.json(
        { message: 'সেকশন কী (key) এবং ডাটা প্রদান করুন' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updated = await SiteContent.findOneAndUpdate(
      { key },
      { key, data, updatedBy: adminCheck.user.phone || 'admin' },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'সেকশনের লেখা ও ছবি সফলভাবে আপডেট করা হয়েছে',
      content: updated,
    });
  } catch (error) {
    console.error('Site content update error:', error);
    return NextResponse.json(
      { message: 'আপডেট করা সম্ভব হয়নি: ' + error.message },
      { status: 500 }
    );
  }
}
