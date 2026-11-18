'use client';

export default function CategoryGridSkeleton({ count = 7 }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0 animate-fadeIn">
      {items.map((i) => (
        <div
          key={i}
          className="flex-shrink-0 w-32 xs:w-36 sm:w-auto bg-white rounded-2xl p-2.5 sm:p-3.5 border border-[#E8E2D5] shadow-xs flex flex-col items-center text-center animate-pulse"
        >
          {/* Circular/Rounded Category Thumbnail */}
          <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl bg-stone-200/70 mb-2 sm:mb-3" />

          {/* Title line */}
          <div className="h-3.5 bg-stone-200/80 rounded w-20 mb-1.5" />

          {/* Subtitle line */}
          <div className="h-2.5 bg-stone-100 rounded w-14 mb-2" />

          {/* Badge line */}
          <div className="h-4 bg-stone-100 rounded-full w-16" />
        </div>
      ))}
    </div>
  );
}
