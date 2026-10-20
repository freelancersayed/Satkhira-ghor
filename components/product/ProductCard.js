'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingBag, Eye } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const badgeColorMap = {
    forest: 'bg-[#1B4D3E] text-white',
    honey: 'bg-[#E5A93C] text-[#102E25]',
    ochre: 'bg-[#C86D3B] text-white',
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#EFE9DC] shadow-sm hover:shadow-xl hover:border-[#1B4D3E]/30 transition-all duration-300 flex flex-col h-full">
      {/* Image Container with Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#FAF8F4]">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute top-2 left-2 sm:top-3 sm:left-3 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm z-10 ${
              badgeColorMap[product.badgeType] || 'bg-[#1B4D3E] text-white'
            }`}
          >
            {product.badge}
          </span>
        )}

        {/* Floating Quick Action Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 pointer-events-none">
          <Link
            href={`/products/${product.slug}`}
            className="pointer-events-auto p-2.5 bg-white text-[#1B4D3E] rounded-full shadow-lg hover:bg-[#1B4D3E] hover:text-white transition-colors transform translate-y-2 group-hover:translate-y-0 duration-200"
            aria-label="View Product Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          {/* Category & Unit */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#4A5B53] font-medium mb-1">
            <span className="text-[#C86D3B] font-semibold truncate max-w-[65%]">{product.categoryName}</span>
            <span className="bg-[#FAF0D4] text-[#7E4E18] px-1.5 sm:px-2 py-0.5 rounded-md font-semibold text-[9px] sm:text-[11px] whitespace-nowrap">
              {product.unit}
            </span>
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-xs sm:text-base text-[#1B4D3E] hover:text-[#C86D3B] line-clamp-2 transition-colors min-h-[2rem] sm:min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>

          {/* Subtitle (English name) */}
          <p className="text-[10px] sm:text-[11px] text-[#4A5B53]/80 line-clamp-1 mt-0.5">
            {product.nameEn}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 sm:mt-2">
            <div className="flex items-center text-[#E5A93C]">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#1B4D3E]">{product.rating}</span>
            <span className="text-[10px] sm:text-[11px] text-[#4A5B53]/70">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart Button */}
        <div className="pt-2 border-t border-[#EFE9DC]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex sm:flex-col items-baseline sm:items-start gap-1.5 sm:gap-0">
            <div className="text-sm sm:text-lg font-black text-[#1B4D3E]">
              ৳{product.price}
            </div>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-xs text-[#4A5B53]/70 line-through">
                ৳{product.originalPrice}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#1B4D3E] hover:bg-[#153D31] text-[#FAF0D4] text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all duration-150 active:scale-95 shadow-sm"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span>কার্টে নিন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
