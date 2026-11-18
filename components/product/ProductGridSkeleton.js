'use client';

export default function ProductGridSkeleton({ count = 10 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 animate-fadeIn">
      {items.map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl sm:rounded-2xl p-2.5 border border-[#E8E2D5] shadow-xs flex flex-col justify-between h-full animate-pulse"
        >
          {/* Image Thumbnail Placeholder */}
          <div className="relative aspect-square w-full rounded-lg sm:rounded-xl bg-stone-200/70 overflow-hidden" />

          {/* Details Placeholder */}
          <div className="pt-2.5 flex-1 flex flex-col justify-between space-y-2">
            <div className="space-y-1.5">
              {/* Product Title (2 lines) */}
              <div className="h-3.5 bg-stone-200/80 rounded-md w-4/5" />
              <div className="h-3 bg-stone-200/50 rounded-md w-3/5" />
              {/* Unit Tag */}
              <div className="h-2.5 bg-stone-100 rounded-md w-2/5 pt-0.5" />
            </div>

            {/* Price Line */}
            <div className="pt-1.5 border-t border-dashed border-stone-200 flex items-baseline gap-2">
              <div className="h-4 bg-stone-200/80 rounded-md w-1/3" />
              <div className="h-3 bg-stone-100 rounded-md w-1/4" />
            </div>
          </div>

          {/* Add to Cart Button Placeholder */}
          <div className="pt-2">
            <div className="w-full h-9 sm:h-10 bg-stone-200/70 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
