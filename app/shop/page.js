'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { products, categories } from '@/data/products';
import ProductGrid from '@/components/product/ProductGrid';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('cat') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProductList(data.products);
        }
      })
      .catch((e) => console.warn('Products fetch error:', e))
      .finally(() => setLoading(false));
  }, []);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return productList
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch =
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // default / featured
      });
  }, [productList, selectedCategory, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="py-10 sm:py-16 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Title & Breadcrumb Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#B45309] uppercase tracking-widest">
            প্রাকৃতিক পণ্য ভান্ডার
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F3D2E]">
            সাতক্ষীরা ঘরের সকল খাঁটি পণ্য
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563]">
            সুন্দরবনের খাঁটি মধু, বিলোনা গাওয়া ঘি, ঘানি ভাঙা সরিষার তেল ও ঐতিহ্যবাহী মিষ্টান্ন
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E8E2D5] shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-7 relative">
              <Search className="w-4 h-4 text-[#4B5563] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="পণ্যের নাম দিয়ে খুঁজুন (যেমন: মধু, ঘি, তেল)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FDFBF7] border border-[#E8E2D5] text-xs sm:text-sm text-[#0F3D2E] focus:outline-none focus:border-[#0F3D2E] transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-3 px-4 rounded-2xl bg-[#FDFBF7] border border-[#E8E2D5] text-xs sm:text-sm text-[#0F3D2E] focus:outline-none focus:border-[#0F3D2E] font-medium transition-colors"
              >
                <option value="featured">ফিচার্ড পণ্য (Featured)</option>
                <option value="price-low">মূল্য: কম থেকে বেশি (Price: Low to High)</option>
                <option value="price-high">মূল্য: বেশি থেকে কম (Price: High to Low)</option>
                <option value="rating">সেরা রেটিং (Highest Rated)</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="md:col-span-2">
              <button
                onClick={handleResetFilters}
                className="w-full py-3 px-4 rounded-2xl bg-[#F7F5F0] hover:bg-[#E8E2D5] text-[#4B5563] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রিসেট ফিল্টার</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
            <span className="text-xs font-bold text-[#0F3D2E] whitespace-nowrap flex items-center gap-1 mr-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D97706]" />
              ক্যাটাগরি:
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#0F3D2E] text-white shadow-md scale-105'
                      : 'bg-[#FDFBF7] text-[#4B5563] hover:bg-[#FEF3C7] hover:text-[#0F3D2E] border border-[#E8E2D5]'
                  }`}
                >
                  {cat.icon && <span className="mr-1">{cat.icon}</span>}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count Header */}
        <div className="flex items-center justify-between text-xs text-[#4B5563] px-1">
          <span>
            সর্বমোট <strong className="text-[#0F3D2E] font-bold">{filteredProducts.length}</strong> টি পণ্য পাওয়া গেছে
          </span>
          {selectedCategory !== 'all' && (
            <span className="text-[#B45309] font-semibold">
              ফিল্টার: {categories.find((c) => c.id === selectedCategory)?.name}
            </span>
          )}
        </div>

        {/* Product Grid / Loading */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#0F3D2E] border-t-[#F59E0B] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#6B7280]">পণ্য লোড হচ্ছে...</p>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="w-12 h-12 border-4 border-[#0F3D2E] border-t-[#F59E0B] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#0F3D2E]">পণ্য লোড হচ্ছে...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
