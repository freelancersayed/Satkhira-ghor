'use client';

import { useRef } from 'react';
import { Printer, X, Sparkles, CheckCircle2, Phone, MapPin, Calendar, Package } from 'lucide-react';

export default function OrderInvoiceModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'তারিখ উপলব্ধ নেই';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container - Printable Sheet */}
      <div className="bg-white rounded-3xl max-w-2xl w-full my-6 border border-[#EFE9DC] shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Action Header (Hidden during print) */}
        <div className="no-print bg-[#102E25] text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#E5A93C]" />
            <h3 className="text-sm font-bold">
              পার্সেল ভাউচার ও চালানের প্রিন্ট কপি (#{order.orderNumber})
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#E5A93C] hover:bg-[#d6982b] text-[#102E25] font-black rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= Printable Voucher Document ================= */}
        <div className="p-6 sm:p-8 space-y-6 text-[#102E25] print-area bg-white text-xs">
          {/* Brand Header */}
          <div className="flex justify-between items-start border-b-2 border-[#1B4D3E] pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#1B4D3E] flex items-center justify-center text-[#E5A93C] font-serif font-black text-3xl shadow-sm">
                স
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#1B4D3E] tracking-tight">
                  সাতক্ষীরা ঘর
                </h1>
                <p className="text-[11px] font-bold text-[#C86D3B] tracking-wider uppercase">
                  Satkhira Ghor • Pure & Organic Heritage
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  সুন্দরবনের খাঁটি মধু ও উপকূলের শতভাগ বিশুদ্ধ খাদ্য সম্ভার
                </p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="inline-block bg-[#1B4D3E] text-[#FAF0D4] px-3 py-1 rounded-lg text-xs font-black">
                পার্সেল চালান ও মেমো
              </div>
              <div className="font-mono font-black text-sm text-[#1B4D3E]">
                #{order.orderNumber}
              </div>
              <div className="text-[10px] text-gray-500">{formattedDate}</div>
            </div>
          </div>

          {/* Shipping Addresses Box (Designed for packaging label paste) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Delivery To (Customer Parcel Label) */}
            <div className="border-2 border-[#1B4D3E] rounded-2xl p-4 bg-[#FAF8F4] space-y-2 relative">
              <div className="absolute top-0 right-0 bg-[#1B4D3E] text-[#FAF0D4] text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl uppercase">
                প্রাপক (Delivery To)
              </div>
              <div>
                <span className="text-[10px] text-gray-500">গ্রাহকের নাম:</span>
                <h2 className="text-base font-black text-[#1B4D3E]">
                  {order.customer?.name}
                </h2>
              </div>

              <div>
                <span className="text-[10px] text-gray-500">মোবাইল নম্বর:</span>
                <div className="text-sm font-black text-[#C86D3B] font-mono flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{order.customer?.phone}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-gray-500">ডেলিভারি ঠিকানা:</span>
                <p className="font-semibold text-xs text-gray-800 leading-relaxed">
                  {order.customer?.address}, {order.customer?.city}
                </p>
              </div>

              {order.customer?.notes && (
                <div className="pt-1 border-t border-gray-200 text-[10px] text-gray-600">
                  <strong>গ্রাহকের বিশেষ নোট:</strong> {order.customer.notes}
                </div>
              )}
            </div>

            {/* Sent From (Brand Contact) */}
            <div className="border border-gray-200 rounded-2xl p-4 space-y-2 bg-gray-50/50">
              <div className="text-[10px] font-black text-[#1B4D3E] uppercase tracking-wider">
                প্রেরক (Sender / Brand Office)
              </div>
              <div className="font-bold text-sm text-[#1B4D3E]">
                সাতক্ষীরা ঘর (হেড অফিস)
              </div>
              <p className="text-[11px] text-gray-600">
                শ্যামনগর ও সাতক্ষীরা সদর, খুলনা বিভাগ।
              </p>
              <div className="text-[11px] text-gray-700 font-semibold space-y-0.5 pt-1">
                <div>📞 হেল্পলাইন: ০১৭১২-৩৪৫৬৭৮</div>
                <div>🌐 ওয়েবসাইট: satkhiraghor.com</div>
                <div>📧 সাপোর্ট: support@satkhiraghor.com</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs text-[#1B4D3E] uppercase tracking-wider">
              অর্ডারকৃত পণ্যের বিবরণ (Order Items)
            </h3>
            <table className="w-full text-xs text-left border-collapse border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-[#FAF8F4] text-[#1B4D3E] font-bold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3 border-r border-gray-200">ক্রমিক</th>
                  <th className="py-2.5 px-3 border-r border-gray-200">পণ্যের নাম ও বিবরণ</th>
                  <th className="py-2.5 px-3 border-r border-gray-200 text-center">পরিমাণ</th>
                  <th className="py-2.5 px-3 border-r border-gray-200 text-right">একক মূল্য</th>
                  <th className="py-2.5 px-3 text-right">মোট টাকা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 border-r border-gray-200 text-center font-bold text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200">
                      <div className="font-bold text-[#102E25]">{item.name}</div>
                      {item.unit && <div className="text-[10px] text-gray-500">{item.unit}</div>}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200 text-center font-bold">
                      {item.quantity} টি
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200 text-right font-mono">
                      ৳{item.price}
                    </td>
                    <td className="py-2 px-3 text-right font-bold font-mono">
                      ৳{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Billing & Total Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 border-t-2 border-dashed border-gray-300">
            <div className="space-y-1">
              <div className="text-xs font-bold text-gray-700">
                পেমেন্ট পদ্ধতি: {' '}
                <span className="font-black text-[#1B4D3E]">
                  {order.paymentMethod === 'cod'
                    ? 'ক্যাশ অন ডেলিভারি (পণ্য পেয়ে মূল্য পরিশোধ)'
                    : 'অনলাইন / মোবাইল ব্যাংকিং'}
                </span>
              </div>
              <div className="text-[11px] text-gray-500">
                অর্ডার স্ট্যাটাস: <span className="capitalize font-bold text-emerald-700">{order.orderStatus}</span>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 bg-[#FAF8F4] p-3 rounded-xl border border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>পণ্যের মোট মূল্য:</span>
                <span className="font-mono">৳{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-mono">
                  {order.deliveryFee === 0 ? 'ফ্রি' : `৳${order.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#1B4D3E] pt-1.5 border-t border-gray-300">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="text-[#C86D3B] text-base font-mono">৳{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Packaging Note & Brand Stamp Footer */}
          <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-[10px] text-gray-500">
            <div>
              <p className="font-bold text-[#1B4D3E]">
                🌿 সাতক্ষীরা ঘর থেকে কেনাকাটা করার জন্য ধন্যবাদ!
              </p>
              <p className="mt-0.5">
                খাঁটি ও প্রাকৃতিক পণ্য আপনার দোরগোড়ায় নিরাপদে পৌঁছে দিতে আমরা বদ্ধপরিকর।
              </p>
            </div>

            <div className="border border-dashed border-[#1B4D3E] px-4 py-1.5 rounded-lg text-center">
              <div className="text-[9px] uppercase font-bold text-[#1B4D3E]">
                Authorized Seal & Quality Verified
              </div>
              <div className="font-serif font-black text-xs text-[#E5A93C]">
                সাতক্ষীরা ঘর • Satkhira Ghor
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 15px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
