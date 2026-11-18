import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireManagerOrAdmin } from '@/lib/auth';
import { invalidateCache, sanitizeBase64 } from '@/lib/performance';

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

    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const filter = isMongoId ? { _id: id } : { slug: id };

    // Auto-sanitize any Base64 images to static files
    if (body.image) {
      body.image = await sanitizeBase64(body.image, `prod_edit_${id}`);
    }
    if (body.images) {
      body.images = await sanitizeBase64(body.images, `prod_edit_${id}_gallery`);
    }

    // If primary image was updated, ensure images array keeps the primary image at index 0
    let imagesUpdate = body.images;
    if (body.image) {
      if (Array.isArray(imagesUpdate) && imagesUpdate.length > 0) {
        imagesUpdate = [body.image, ...imagesUpdate.filter((img) => img !== body.image)];
      } else {
        const existing = await Product.findOne(filter).select('images').lean();
        const prevImages = Array.isArray(existing?.images) ? existing.images : [];
        imagesUpdate = [body.image, ...prevImages.filter((img) => img !== body.image)];
      }
    }

    const updatedProduct = await Product.findOneAndUpdate(
      filter,
      {
        ...body,
        ...(imagesUpdate ? { images: imagesUpdate } : {}),
        price: body.price !== undefined ? Number(body.price) : undefined,
        originalPrice: body.originalPrice !== undefined ? Number(body.originalPrice) : undefined,
        stock: body.stock !== undefined ? Number(body.stock) : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ message: 'পণ্যটি খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    invalidateCache('products');

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      if (updatedProduct.slug) {
        revalidatePath(`/products/${updatedProduct.slug}`);
      }
    } catch (e) {}

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

    invalidateCache('products');

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
    } catch (e) {}

    return NextResponse.json({ message: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { message: 'পণ্য মোছা সম্ভব হয়নি: ' + error.message },
      { status: 500 }
    );
  }
}
