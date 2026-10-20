import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { getSessionUser } from '@/lib/auth';
import { products as fallbackProducts } from '@/data/products';

export const dynamic = 'force-dynamic';

// GET: Fetch reviews for a product or all reviews
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const productId = searchParams.get('productId');
    const all = searchParams.get('all');

    // Admin requesting all reviews
    if (all === 'true') {
      const user = await getSessionUser(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ message: 'অননুমোদিত অ্যাক্সেস' }, { status: 403 });
      }

      const reviews = await Review.find({}).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, reviews });
    }

    // Product specific reviews
    let query = { status: 'approved' };
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      query.product = productId;
    } else if (slug || productId) {
      query.productSlug = slug || productId;
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();

    // Calculate rating breakdown
    const totalReviews = reviews.length;
    let sumRating = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((r) => {
      sumRating += r.rating;
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
    });

    const averageRating = totalReviews > 0 ? (sumRating / totalReviews).toFixed(1) : '5.0';

    return NextResponse.json({
      success: true,
      reviews,
      stats: {
        totalReviews,
        averageRating: Number(averageRating),
        distribution,
      },
    });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json(
      { message: 'রিভিউ লোড করতে ব্যর্থ হয়েছে: ' + error.message },
      { status: 500 }
    );
  }
}

// POST: Submit a new review or update existing review
export async function POST(request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { message: 'রিভিউ দিতে দয়া করে প্রথমে লগইন করুন' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { productId, productSlug, rating, comment, images = [], orderId = '', productName, productImage } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'দয়া করে ১ থেকে ৫ এর মধ্যে রেটিং নির্বাচন করুন' },
        { status: 400 }
      );
    }

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { message: 'দয়া করে আপনার মতামত বা রিভিউ লিখুন' },
        { status: 400 }
      );
    }

    // ── Find the product flexibly (support ObjectId, Slug, or Fallback Products) ──
    let product = null;

    // 1. Try by ObjectId if valid
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }

    // 2. Try by slug
    if (!product && (productSlug || productId)) {
      const searchSlug = productSlug || productId;
      product = await Product.findOne({
        $or: [{ slug: searchSlug }, { slug: String(searchSlug).toLowerCase() }],
      });
    }

    // 3. Try by name
    if (!product && productName) {
      product = await Product.findOne({ name: productName });
    }

    // 4. If product still not in MongoDB, find in fallbackProducts and auto-seed it into MongoDB!
    if (!product) {
      const targetIdentifier = productSlug || productId || productName;
      const foundFallback = fallbackProducts.find(
        (p) =>
          p.slug === targetIdentifier ||
          p.id === targetIdentifier ||
          p.name === targetIdentifier
      );

      if (foundFallback) {
        product = await Product.create({
          name: foundFallback.name,
          nameEn: foundFallback.nameEn || '',
          slug: foundFallback.slug,
          category: foundFallback.category,
          categoryName: foundFallback.categoryName,
          price: foundFallback.price,
          originalPrice: foundFallback.originalPrice || null,
          unit: foundFallback.unit || '১ কেজি',
          rating: foundFallback.rating || 5.0,
          reviewCount: foundFallback.reviewCount || 0,
          stock: foundFallback.stock || 20,
          badge: foundFallback.badge || '',
          badgeType: foundFallback.badgeType || 'forest',
          image: foundFallback.image,
          images: foundFallback.images || [foundFallback.image],
          shortDescription: foundFallback.shortDescription || '',
          description: foundFallback.description || '',
          origin: foundFallback.origin || 'সাতক্ষীরা',
        });
      }
    }

    if (!product) {
      return NextResponse.json(
        { message: 'পণ্যটি ডাটাবেজে পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    // Check if verified purchaser
    let isVerifiedPurchase = false;
    try {
      if (user.id) {
        const orderMatch = await Order.findOne({
          $or: [{ user: user.id }, { 'customer.phone': user.phone }],
          'items.productId': { $in: [product._id.toString(), product.slug, productId] },
        });
        if (orderMatch) {
          isVerifiedPurchase = true;
        }
      }
    } catch (e) {
      // Non-fatal
    }

    // Check if user already reviewed this product
    let review = await Review.findOne({
      user: user.id,
      product: product._id,
    });

    const finalImages = Array.isArray(images)
      ? images.filter(Boolean)
      : typeof images === 'string' && images
      ? [images]
      : [];

    if (review) {
      // Update existing review
      review.rating = Number(rating);
      review.comment = comment.trim();
      review.images = finalImages;
      review.userName = user.name || review.userName;
      review.userPhone = user.phone || review.userPhone;
      review.productName = product.name;
      review.productSlug = product.slug;
      review.productImage = product.image;
      if (isVerifiedPurchase) review.isVerifiedPurchase = true;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        user: user.id,
        userName: user.name || 'সম্মানিত গ্রাহক',
        userPhone: user.phone || '',
        product: product._id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.image,
        rating: Number(rating),
        comment: comment.trim(),
        images: finalImages,
        orderId: orderId || '',
        isVerifiedPurchase,
        status: 'approved',
      });
    }

    // Recalculate average rating & count for this product
    const allApprovedReviews = await Review.find({
      product: product._id,
      status: 'approved',
    });

    const totalCount = allApprovedReviews.length;
    const totalSum = allApprovedReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const newAverage = totalCount > 0 ? Number((totalSum / totalCount).toFixed(1)) : 5.0;

    await Product.findByIdAndUpdate(product._id, {
      rating: newAverage,
      reviewCount: totalCount,
    });

    return NextResponse.json({
      success: true,
      message: 'আপনার মূল্যবান রিভিউ সফলভাবে প্রকাশিত হয়েছে!',
      review,
      productStats: {
        rating: newAverage,
        reviewCount: totalCount,
      },
    });
  } catch (error) {
    console.error('Reviews POST error:', error);
    return NextResponse.json(
      { message: 'রিভিউ সাবমিট ব্যর্থ হয়েছে: ' + (error.message || 'অজানা ত্রুটি') },
      { status: 500 }
    );
  }
}
