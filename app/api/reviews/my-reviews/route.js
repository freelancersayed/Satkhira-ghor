import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Fetch all reviews written by the currently logged-in user
export async function GET(request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ message: 'দয়া করে লগইন করুন' }, { status: 401 });
    }

    await connectToDatabase();

    const reviews = await Review.find({ user: user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error('My-reviews GET error:', error);
    return NextResponse.json(
      { message: 'রিভিউ লোড করতে ব্যর্থ হয়েছে: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove a review
export async function DELETE(request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ message: 'অননুমোদিত অনুরোধ' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ message: 'রিভিউ আইডি আবশ্যক' }, { status: 400 });
    }

    await connectToDatabase();

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ message: 'রিভিউটি পাওয়া যায়নি' }, { status: 404 });
    }

    // Only creator or admin can delete
    if (review.user.toString() !== user.id && user.role !== 'admin') {
      return NextResponse.json({ message: 'শুধুমাত্র নিজের রিভিউ ডিলিট করা যাবে' }, { status: 403 });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(reviewId);

    // Recalculate product rating
    if (productId) {
      const remainingReviews = await Review.find({ product: productId, status: 'approved' });
      const totalCount = remainingReviews.length;
      const totalSum = remainingReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const newAverage = totalCount > 0 ? Number((totalSum / totalCount).toFixed(1)) : 5.0;

      await Product.findByIdAndUpdate(productId, {
        rating: newAverage,
        reviewCount: totalCount,
      });
    }

    return NextResponse.json({ success: true, message: 'রিভিউটি মুছে ফেলা হয়েছে' });
  } catch (error) {
    console.error('My-reviews DELETE error:', error);
    return NextResponse.json(
      { message: 'মুছে ফেলতে ব্যর্থ হয়েছে: ' + error.message },
      { status: 500 }
    );
  }
}
