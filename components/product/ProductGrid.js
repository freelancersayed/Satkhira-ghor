import ProductCard from './ProductCard';

export default function ProductGrid({ products = [] }) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-[#EFE9DC] max-w-lg mx-auto">
        <div className="w-16 h-16 bg-[#FAF0D4] rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
          🍃
        </div>
        <h3 className="text-lg font-bold text-[#1B4D3E]">কোনো পণ্য পাওয়া যায়নি</h3>
        <p className="text-xs text-[#4A5B53] mt-2">
          অনুগ্রহ করে ফিল্টার পরিবর্তন করুন অথবা অন্য কি-ওয়ার্ড দিয়ে খুঁজুন।
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
