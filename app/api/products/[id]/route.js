import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireManagerOrAdmin } from '@/lib/auth';
import { products as fallbackProducts } from '@/data/products';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    await connectToDatabase();

    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return NextResponse.json({ message: 'পণ্য খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const adminCheck = await requireManagerOrAdmin(request);
    if (adminCheck.error) {
      return NextResponse.json(
        { message: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { id } = params;
    const body = await request.json();

    await connectToDatabase();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...body,
        price: body.price !== undefined ? Number(body.price) : undefined,
        originalPrice: body.originalPrice !== undefined ? Number(body.originalPrice) : undefined,
        stock: body.stock !== undefined ? Number(body.stock) : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ message: 'পণ্যটি খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'পণ্য সফলভাবে আপডেট করা হয়েছে',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { message: 'পণ্য আপডেট করা যায়নি: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const adminCheck = await requireManagerOrAdmin(request);
    if (adminCheck.error) {
      return NextResponse.json(
        { message: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { id } = params;
    await connectToDatabase();

    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }
    if (!deleted) {
      deleted = await Product.findOneAndUpdate(
        { slug: id },
        { isDeleted: true },
        { new: true }
      );
    }

    // If it's a fallback product that was not yet in MongoDB, record it as isDeleted: true
    if (!deleted) {
      const fb = fallbackProducts.find((p) => p.slug === id || p.id === id);
      if (fb) {
        await Product.create({
          name: fb.name,
          nameEn: fb.nameEn || '',
          slug: fb.slug,
          category: fb.category,
          categoryName: fb.categoryName,
          price: fb.price,
          originalPrice: fb.originalPrice || null,
          unit: fb.unit || '১ কেজি',
          image: fb.image,
          images: fb.images || [fb.image],
          shortDescription: fb.shortDescription || '',
          description: fb.description || '',
          origin: fb.origin || 'সাতক্ষীরা',
          isDeleted: true,
        });
        deleted = true;
      }
    }

    if (!deleted) {
      return NextResponse.json({ message: 'পণ্যটি খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({ message: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { message: 'পণ্য মোছা সম্ভব হয়নি: ' + error.message },
      { status: 500 }
    );
  }
}
