import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';
import { requireAdmin } from '@/lib/auth';
import { categories as defaultCategories } from '@/data/products';

export const dynamic = 'force-dynamic';

async function getStoredCategories() {
  await connectToDatabase();
  const doc = await SiteContent.findOne({ key: 'categories' }).lean();
  if (doc && Array.isArray(doc.data) && doc.data.length > 0) {
    return doc.data;
  }
  return defaultCategories;
}

// GET all categories
export async function GET() {
  try {
    const categories = await getStoredCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.warn('Categories GET fallback:', error.message);
    return NextResponse.json({ success: true, categories: defaultCategories });
  }
}

// POST: Add new category
export async function POST(request) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck.error) {
      return NextResponse.json({ message: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const { name, nameEn, slug, icon, image, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'ক্যাটাগরির বাংলা নাম আবশ্যক' }, { status: 400 });
    }

    const cleanSlug = (slug || nameEn || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0980-\u09FF-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug) {
      return NextResponse.json({ message: 'বৈধ ক্যাটাগরি স্লাগ দিন' }, { status: 400 });
    }

    await connectToDatabase();
    const currentCategories = await getStoredCategories();

    // Check duplicate slug
    if (currentCategories.some((c) => c.slug === cleanSlug)) {
      return NextResponse.json({ message: 'এই স্লাগ দিয়ে ইতিমধ্যে একটি ক্যাটাগরি রয়েছে' }, { status: 400 });
    }

    const newCategory = {
      id: cleanSlug,
      name: name.trim(),
      nameEn: nameEn?.trim() || name.trim(),
      slug: cleanSlug,
      icon: icon?.trim() || '🌿',
      image: image?.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
      description: description?.trim() || '',
    };

    const updatedCategories = [...currentCategories, newCategory];

    await SiteContent.findOneAndUpdate(
      { key: 'categories' },
      { key: 'categories', data: updatedCategories, updatedBy: adminCheck.user.phone || 'admin' },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'নতুন ক্যাটাগরি সফলভাবে যুক্ত হয়েছে',
      categories: updatedCategories,
    });
  } catch (error) {
    console.error('Category POST error:', error);
    return NextResponse.json({ message: 'ক্যাটাগরি যুক্ত করা সম্ভব হয়নি: ' + error.message }, { status: 500 });
  }
}

// PUT: Update category or update full category list
export async function PUT(request) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck.error) {
      return NextResponse.json({ message: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    await connectToDatabase();

    // Case 1: Bulk replace / reorder
    if (Array.isArray(body.categories)) {
      await SiteContent.findOneAndUpdate(
        { key: 'categories' },
        { key: 'categories', data: body.categories, updatedBy: adminCheck.user.phone || 'admin' },
        { upsert: true, new: true }
      );
      return NextResponse.json({
        success: true,
        message: 'ক্যাটাগরি তালিকা সফলভাবে সংরক্ষিত হয়েছে',
        categories: body.categories,
      });
    }

    // Case 2: Update specific category
    const { slug, name, nameEn, icon, image, description } = body;
    if (!slug) {
      return NextResponse.json({ message: 'ক্যাটাগরি স্লাগ উল্লেখ করুন' }, { status: 400 });
    }

    const currentCategories = await getStoredCategories();
    const index = currentCategories.findIndex((c) => c.slug === slug || c.id === slug);

    if (index === -1) {
      return NextResponse.json({ message: 'ক্যাটাগরি খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    const updated = [...currentCategories];
    updated[index] = {
      ...updated[index],
      name: name !== undefined ? name.trim() : updated[index].name,
      nameEn: nameEn !== undefined ? nameEn.trim() : updated[index].nameEn,
      icon: icon !== undefined ? icon.trim() : updated[index].icon,
      image: image !== undefined ? image.trim() : updated[index].image,
      description: description !== undefined ? description.trim() : updated[index].description,
    };

    await SiteContent.findOneAndUpdate(
      { key: 'categories' },
      { key: 'categories', data: updated, updatedBy: adminCheck.user.phone || 'admin' },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'ক্যাটাগরি ও ছবি সফলভাবে আপডেট করা হয়েছে',
      categories: updated,
    });
  } catch (error) {
    console.error('Category PUT error:', error);
    return NextResponse.json({ message: 'আপডেট করা সম্ভব হয়নি: ' + error.message }, { status: 500 });
  }
}

// DELETE: Remove category
export async function DELETE(request) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck.error) {
      return NextResponse.json({ message: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug || slug === 'all') {
      return NextResponse.json({ message: 'এই ক্যাটাগরি ডিলিট করা সম্ভব নয়' }, { status: 400 });
    }

    await connectToDatabase();
    const currentCategories = await getStoredCategories();
    const filtered = currentCategories.filter((c) => c.slug !== slug && c.id !== slug);

    await SiteContent.findOneAndUpdate(
      { key: 'categories' },
      { key: 'categories', data: filtered, updatedBy: adminCheck.user.phone || 'admin' },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'ক্যাটাগরি সফলভাবে ডিলিট করা হয়েছে',
      categories: filtered,
    });
  } catch (error) {
    console.error('Category DELETE error:', error);
    return NextResponse.json({ message: 'ডিলিট করা সম্ভব হয়নি: ' + error.message }, { status: 500 });
  }
}
