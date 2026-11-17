'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  X,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowUpDown,
  Tag,
  DollarSign,
} from 'lucide-react';
import { categories as defaultDataCategories } from '@/data/products';
import ProductGrid from '@/components/product/ProductGrid';

const toBanglaNum = (num) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[d]);
};

const PRICE_PRESETS = [
  { id: 'all', label: 'সকল মূল্য' },
  { id: 'under-500', label: '৳৫০০ এর নিচে', min: 0, max: 499 },
  { id: '500-1000', label: '৳৫০০ - ৳১,০০০', min: 500, max: 1000 },
  { id: '1000-2000', label: '৳১,০০০ - ৳২,০০০', min: 1000, max: 2000 },
  { id: '2000-above', label: '৳২,০০০ এর বেশি', min: 2001, max: Infinity },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initial params
  const initialCategory = searchParams.get('cat') || searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'featured';
  const initialPrice = searchParams.get('price') || 'all';
  const initialInStock = searchParams.get('inStock') === 'true';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);
  const [priceRange, setPriceRange] = useState(initialPrice);
  const [inStockOnly, setInStockOnly] = useState(initialInStock);

  const [productList, setProductList] = useState([]);
  const [categoriesList, setCategoriesList] = useState(
    Array.isArray(defaultDataCategories) ? defaultDataCategories : []
  );
  const [loading, setLoading] = useState(true);

  // Sync state if URL query params change externally
  useEffect(() => {
    const cat = searchParams.get('cat') || searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat || 'all');
    const s = searchParams.get('search');
    if (s !== null) setSearchQuery(s);
    const sort = searchParams.get('sort');
    if (sort !== null) setSortBy(sort);
    const price = searchParams.get('price');
    if (price !== null) setPriceRange(price);
    const stock = searchParams.get('inStock');
    if (stock !== null) setInStockOnly(stock === 'true');
  }, [searchParams]);

  // Push filter changes into URL seamlessly
  const updateURL = useCallback(
    (newFilters) => {
      const params = new URLSearchParams();
      const cat = newFilters.category !== undefined ? newFilters.category : selectedCategory;
      const s = newFilters.search !== undefined ? newFilters.search : searchQuery;
      const sort = newFilters.sort !== undefined ? newFilters.sort : sortBy;
      const price = newFilters.price !== undefined ? newFilters.price : priceRange;
      const stock = newFilters.inStock !== undefined ? newFilters.inStock : inStockOnly;

      if (cat && cat !== 'all') params.set('cat', cat);
      if (s && s.trim()) params.set('search', s.trim());
      if (sort && sort !== 'featured') params.set('sort', sort);
      if (price && price !== 'all') params.set('price', price);
      if (stock) params.set('inStock', 'true');

      const queryString = params.toString();
      const nextUrl = queryString ? `/shop?${queryString}` : '/shop';
      router.replace(nextUrl, { scroll: false });
    },
    [selectedCategory, searchQuery, sortBy, priceRange, inStockOnly, router]
  );

  // Load products & categories from database
  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.products)) {
          setProductList(data.products);
        }
      })
      .catch((e) => console.warn('Products fetch error:', e))
      .finally(() => setLoading(false));

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.categories)) {
          setCategoriesList(data.categories);
        }
      })
      .catch((e) => console.warn('Categories fetch error:', e));
  }, []);

  // Compute live product counts per category with intelligent resilient matching
  const getCategoryCount = useCallback(
    (cat) => {
      const slug = cat.slug?.toLowerCase()?.trim() || '';
      const name = cat.name?.toLowerCase()?.trim() || '';
      const id = cat.id?.toLowerCase()?.trim() || '';
      const norm = (s) => (s ? s.replace(/[^a-z0-9]/g, '') : '');

      return productList.filter((p) => {
        const pCat = p.category?.toLowerCase()?.trim() || '';
        const pName = p.categoryName?.toLowerCase()?.trim() || '';
        if (
          (slug && pCat === slug) ||
          (id && pCat === id) ||
          (slug && norm(slug) && (norm(slug).includes(norm(pCat)) || norm(pCat).includes(norm(slug))))
        ) {
          return true;
        }
        if (
          name &&
          (pName === name || pCat === name || pName.includes(name) || name.includes(pName))
        ) {
          return true;
        }
        return false;
      }).length;
    },
    [productList]
  );

  // Filter & sort products (Seamless dynamic category, price, stock & search query matching)
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const catTarget = selectedCategory?.toLowerCase()?.trim() || 'all';
    const currentPricePreset = PRICE_PRESETS.find((p) => p.id === priceRange);

    return productList
      .filter((product) => {
        // 1. Category matching:
        let matchesCategory = false;
        if (catTarget === 'all' || !catTarget) {
          matchesCategory = true;
        } else {
          const prodCat = product.category?.toLowerCase()?.trim() || '';
          const prodCatName = product.categoryName?.toLowerCase()?.trim() || '';

          if (
            prodCat === catTarget ||
            prodCatName === catTarget ||
            prodCatName.includes(catTarget) ||
            catTarget.includes(prodCatName)
          ) {
            matchesCategory = true;
          } else {
            const matchedCat = categoriesList.find(
              (c) =>
                c.slug?.toLowerCase() === catTarget ||
                c.id?.toLowerCase() === catTarget ||
                c.name?.toLowerCase() === catTarget ||
                c.nameEn?.toLowerCase() === catTarget
            );

            if (matchedCat) {
              const catSlug = matchedCat.slug?.toLowerCase()?.trim() || '';
              const catId = matchedCat.id?.toLowerCase()?.trim() || '';
              const catName = matchedCat.name?.toLowerCase()?.trim() || '';
              const catNameEn = matchedCat.nameEn?.toLowerCase()?.trim() || '';
              const norm = (s) => (s ? s.replace(/[^a-z0-9]/g, '') : '');

              if (
                (catSlug && prodCat === catSlug) ||
                (catId && prodCat === catId) ||
                (catSlug && norm(catSlug) && (norm(catSlug).includes(norm(prodCat)) || norm(prodCat).includes(norm(catSlug)))) ||
                (catName && (prodCat === catName || prodCatName === catName || prodCatName.includes(catName) || catName.includes(prodCatName))) ||
                (catNameEn && (prodCat === catNameEn || prodCatName.includes(catNameEn)))
              ) {
                matchesCategory = true;
              }
            }
          }
        }

        // 2. Search matching
        const matchesSearch =
          !q ||
          product.name?.toLowerCase().includes(q) ||
          product.nameEn?.toLowerCase().includes(q) ||
          product.shortDescription?.toLowerCase().includes(q) ||
          product.description?.toLowerCase().includes(q) ||
          product.category?.toLowerCase().includes(q) ||
          product.categoryName?.toLowerCase().includes(q) ||
          product.slug?.toLowerCase().includes(q);

        // 3. Price range matching
        let matchesPrice = true;
        if (currentPricePreset && currentPricePreset.id !== 'all') {
          const price = Number(product.price) || 0;
          matchesPrice = price >= currentPricePreset.min && price <= currentPricePreset.max;
        }

        // 4. In-Stock matching
        let matchesStock = true;
        if (inStockOnly) {
          matchesStock = product.stock !== undefined ? Number(product.stock) > 0 : true;
        }

        return matchesCategory && matchesSearch && matchesPrice && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return (Number(a.price) || 0) - (Number(b.price) || 0);
        if (sortBy === 'price-high') return (Number(b.price) || 0) - (Number(a.price) || 0);
        if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        if (sortBy === 'newest') {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }
        return 0; // default / featured
      });
  }, [productList, selectedCategory, searchQuery, sortBy, priceRange, inStockOnly, categoriesList]);

  // Handlers
  const handleSelectCategory = (catSlug) => {
    setSelectedCategory(catSlug);
    updateURL({ category: catSlug });
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    updateURL({ search: value });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    updateURL({ search: '' });
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    updateURL({ sort: newSort });
  };

  const handlePriceChange = (newPrice) => {
    setPriceRange(newPrice);
    updateURL({ price: newPrice });
  };

  const handleToggleStock = () => {
    const nextVal = !inStockOnly;
    setInStockOnly(nextVal);
    updateURL({ inStock: nextVal });
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setPriceRange('all');
    setInStockOnly(false);
    router.replace('/shop', { scroll: false });
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim().length > 0 ||
    priceRange !== 'all' ||
    inStockOnly;

  const currentCategoryObj = categoriesList.find(
    (c) =>
      c.slug?.toLowerCase() === selectedCategory?.toLowerCase() ||
      c.id?.toLowerCase() === selectedCategory?.toLowerCase() ||
      c.name?.toLowerCase() === selectedCategory?.toLowerCase()
  );

  return (
    <div className="py-8 sm:py-14 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Page Title & Breadcrumb Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#B45309] uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>প্রাকৃতিক খাদ্য ভান্ডার</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#016831]">
            সাতক্ষীরা ঘরের সকল খাঁটি পণ্য
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563]">
            সুন্দরবনের খাঁটি মধু, বিলোনা গাওয়া ঘি, ঘানি ভাঙা সরিষার তেল ও ঐতিহ্যবাহী মিষ্টান্ন
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E8E2D5] shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 text-[#016831] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="পণ্যের নাম দিয়ে খুঁজুন (মধু, ঘি, তেল, সন্দেশ)..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-2xl bg-[#FDFBF7] border border-[#E8E2D5] text-xs sm:text-sm text-[#016831] placeholder:text-[#8E9C96] focus:outline-none focus:border-[#016831] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="lg:col-span-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full py-2.5 sm:py-3 px-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E8E2D5] text-xs sm:text-sm text-[#016831] focus:outline-none focus:border-[#016831] font-semibold transition-colors"
                >
                  <option value="featured">✨ সেরা ও ফিচার্ড পণ্য (Featured)</option>
                  <option value="newest">🆕 নতুন সংযোজিত পণ্য (Newest)</option>
                  <option value="price-low">📉 মূল্য: কম থেকে বেশি (Price: Low to High)</option>
                  <option value="price-high">📈 মূল্য: বেশি থেকে কম (Price: High to Low)</option>
                  <option value="rating">⭐ সর্বোচ্চ রেটিংপ্রাপ্ত (Top Rated)</option>
                </select>
              </div>
            </div>

            {/* Price Range Filter Dropdown */}
            <div className="lg:col-span-2">
              <select
                value={priceRange}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="w-full py-2.5 sm:py-3 px-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E8E2D5] text-xs sm:text-sm text-[#016831] focus:outline-none focus:border-[#016831] font-semibold transition-colors"
              >
                {PRICE_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* In-Stock Toggle Button */}
            <div className="lg:col-span-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleStock}
                className={`flex-1 py-2.5 sm:py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                  inStockOnly
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                    : 'bg-[#FDFBF7] text-[#4B5563] border-[#E8E2D5] hover:border-[#016831]'
                }`}
              >
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${inStockOnly ? 'text-amber-300' : 'text-stone-400'}`}
                />
                <span>স্টকে আছে</span>
              </button>

              {/* Reset Filter Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  title="ফিল্টার রিসেট করুন"
                  className="p-2.5 sm:p-3 rounded-2xl bg-[#FEF2F2] hover:bg-red-100 text-red-600 transition-colors border border-red-200"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <span className="text-xs font-bold text-[#016831] whitespace-nowrap flex items-center gap-1 mr-1 flex-shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D97706]" />
              ক্যাটাগরি:
            </span>

            {/* All Products Pill */}
            <button
              type="button"
              onClick={() => handleSelectCategory('all')}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-[#016831] text-white shadow-sm scale-102'
                  : 'bg-[#FDFBF7] text-[#4B5563] hover:bg-[#FEF3C7] hover:text-[#016831] border border-[#E8E2D5]'
              }`}
            >
              🌾 সব পণ্য ({toBanglaNum(productList.length)})
            </button>

            {/* Dynamic Category Pills */}
            {categoriesList
              .filter((cat) => cat.slug !== 'all' && cat.id !== 'all')
              .map((cat) => {
                const isSelected =
                  selectedCategory?.toLowerCase() === cat.slug?.toLowerCase() ||
                  selectedCategory?.toLowerCase() === cat.id?.toLowerCase() ||
                  selectedCategory?.toLowerCase() === cat.name?.toLowerCase();
                const count = getCategoryCount(cat);

                return (
                  <button
                    key={cat.id || cat.slug}
                    type="button"
                    onClick={() => handleSelectCategory(cat.slug || cat.id)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#016831] text-white shadow-sm scale-102'
                        : 'bg-[#FDFBF7] text-[#4B5563] hover:bg-[#FEF3C7] hover:text-[#016831] border border-[#E8E2D5]'
                    }`}
                  >
                    {cat.icon && <span>{cat.icon}</span>}
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#E8E2D5]/70 text-[#016831]'
                      }`}
                    >
                      {toBanglaNum(count)}
                    </span>
                  </button>
                );
              })}
          </div>

          {/* Active Filter Badges Bar (Shows when any filter is active) */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-dashed border-[#E8E2D5] text-xs">
              <span className="font-semibold text-stone-500 text-[11px]">সক্রিয় ফিল্টার:</span>

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] font-bold text-[11px] border border-[#FDE68A]">
                  <span>ক্যাটাগরি: {currentCategoryObj?.name || selectedCategory}</span>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('all')}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                  <span>অনুসন্ধান: &ldquo;{searchQuery}&rdquo;</span>
                  <button type="button" onClick={handleClearSearch} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
                  <span>
                    বাজেট: {PRICE_PRESETS.find((p) => p.id === priceRange)?.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePriceChange('all')}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {inStockOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px] border border-emerald-300">
                  <span>শুধুমাত্র স্টকে থাকা পণ্য</span>
                  <button type="button" onClick={handleToggleStock} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-red-600 hover:underline ml-1"
              >
                সব মুছুন
              </button>
            </div>
          )}
        </div>

        {/* Results Count Header */}
        <div className="flex items-center justify-between text-xs text-[#4B5563] px-1">
          <span>
            সর্বমোট{' '}
            <strong className="text-[#016831] font-bold">
              {toBanglaNum(filteredProducts.length)}
            </strong>{' '}
            টি পণ্য পাওয়া গেছে
          </span>
          {selectedCategory !== 'all' && (
            <span className="text-[#B45309] font-semibold">
              নির্বাচিত ক্যাটাগরি: {currentCategoryObj?.name || selectedCategory}
            </span>
          )}
        </div>

        {/* Product Grid / Loading / Empty State */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-[#016831] border-t-[#F59E0B] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#6B7280] font-medium">পণ্য লোড হচ্ছে...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-[#E8E2D5] max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto text-2xl text-[#D97706]">
              🌿
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#016831]">
                কোনো পণ্য খুঁজে পাওয়া যায়নি
              </h3>
              <p className="text-xs text-[#4B5563] mt-1">
                আপনার দেওয়া ফিল্টার বা কিওয়ার্ডের সাথে কোনো পণ্য মেলেনি। নিচের জনপ্রিয় পণ্যগুলো খুঁজে
                দেখতে পারেন:
              </p>
            </div>

            {/* Popular Search Suggestions */}
            <div className="flex flex-wrap gap-2 justify-center pt-1">
              {['সুন্দরবনের মধু', 'খাঁটি গাওয়া ঘি', 'সরিষার তেল', 'ক্ষীর সন্দেশ'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSearchChange(tag)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FEF3C7] text-[#016831] border border-[#E8E2D5] font-semibold transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#016831] hover:bg-[#014D24] text-white text-xs font-bold transition-all shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>সকল ফিল্টার রিসেট করুন</span>
            </button>
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
          <div className="w-12 h-12 border-4 border-[#016831] border-t-[#F59E0B] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#016831]">পণ্য লোড হচ্ছে...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
