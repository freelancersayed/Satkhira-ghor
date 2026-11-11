'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { products } from '@/data/products';

export default function SearchBar({ isMobile = false, onCloseMobile }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const popularSearches = [
    'সুন্দরবনের মধু',
    'গাওয়া ঘি',
    'সরিষার তেল',
    'ক্ষীর সন্দেশ',
    'চিয়া সিড',
    'কম্বো অফার',
  ];

  // Filter matching products
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    return products
      .filter((p) => {
        return (
          p.name?.toLowerCase().includes(trimmed) ||
          p.nameEn?.toLowerCase().includes(trimmed) ||
          p.categoryName?.toLowerCase().includes(trimmed) ||
          p.shortDescription?.toLowerCase().includes(trimmed)
        );
      })
      .slice(0, 6);
  }, [query]);

  // Click outside listener to close search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectProduct = () => {
    setIsOpen(false);
    setQuery('');
    if (onCloseMobile) onCloseMobile();
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    router.push(`/shop?search=${encodeURIComponent(tag)}`);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div
          className={`relative flex items-center w-full rounded-2xl bg-white border transition-all duration-200 ${
            isOpen
              ? 'border-[#016831] ring-2 ring-[#016831]/15 shadow-md'
              : 'border-[#E8E2D5] hover:border-[#016831]/50 shadow-sm'
          }`}
        >
          <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-[#016831]">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#016831]" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="খাঁটি মধু, গাওয়া ঘি, সরিষার তেল, সন্দেশ খুঁজুন..."
            className="w-full py-2.5 sm:py-3 pr-9 bg-transparent text-xs sm:text-sm text-[#14241E] placeholder:text-[#8E9C96] focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="absolute right-3 p-1 rounded-full text-[#8E9C96] hover:text-[#14241E] hover:bg-stone-100 transition-colors"
              aria-label="Clear Search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Instant Dropdown Results */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#E8E2D5] overflow-y-auto max-h-[75vh] z-50 animate-fadeIn">
          {searchResults.length > 0 ? (
            <div className="p-2 sm:p-3 divide-y divide-[#F0EBE1]">
              <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-[#8E9C96]">
                <span>পাওয়া গেছে ({searchResults.length} টি পণ্য)</span>
                <Link
                  href={`/shop?search=${encodeURIComponent(query.trim())}`}
                  onClick={handleSelectProduct}
                  className="text-[#016831] hover:text-[#D97706] flex items-center gap-1 font-bold"
                >
                  <span>সব দেখুন</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-1 pt-1">
                {searchResults.map((product) => {
                  const hasDiscount = Boolean(
                    product.originalPrice && Number(product.originalPrice) > Number(product.price)
                  );
                  return (
                    <Link
                      key={product.id || product.slug}
                      href={`/products/${product.slug}`}
                      onClick={handleSelectProduct}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF8F5] transition-colors group"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 border border-[#E8E2D5]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[#14241E] group-hover:text-[#016831] truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-[#016831]">
                            ৳{product.price}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-stone-400 line-through">
                              ৳{product.originalPrice}
                            </span>
                          )}
                          <span className="text-[10px] text-stone-500 font-medium">
                            • {product.unit}
                          </span>
                        </div>
                      </div>
                      {product.badge && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] flex-shrink-0">
                          {product.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : query.trim().length > 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs sm:text-sm text-[#4B5563]">
                দুঃখিত, &ldquo;<span className="font-bold text-[#016831]">{query}</span>&rdquo; নামে কোনো পণ্য পাওয়া যায়নি।
              </p>
              <p className="text-xs text-stone-400 mt-1">
                নিচের জনপ্রিয় কিওয়ার্ডগুলো দিয়ে খুঁজে দেখতে পারেন:
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                {popularSearches.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#FAF8F5] hover:bg-[#FEF3C7] text-[#016831] border border-[#E8E2D5] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#016831] mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                <span>জনপ্রিয় অনুসন্ধানসমূহ:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#016831] hover:text-white text-[#14241E] border border-[#E8E2D5] transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

