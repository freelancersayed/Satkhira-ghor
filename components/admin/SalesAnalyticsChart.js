'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  DollarSign,
} from 'lucide-react';

export default function SalesAnalyticsChart({ salesTrend = [], bestSellingProducts = [], stagnantProducts = [], statusDistribution = {} }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const maxRevenue = Math.max(...salesTrend.map((d) => d.revenue), 1000);

  // SVG dimensions
  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Generate SVG path points
  const points = salesTrend.map((item, index) => {
    const x = paddingX + (index / Math.max(salesTrend.length - 1, 1)) * chartW;
    const y = height - paddingY - (item.revenue / maxRevenue) * chartH;
    return { x, y, ...item };
  });

  const linePath = points.length > 0
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')
    : '';

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="space-y-6">
      {/* 1. Live Sales Trend Chart Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D5] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div className="flex items-center gap-2 text-slate-800 font-black text-sm sm:text-base">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              <span>গত ৭ দিনের বিক্রয় প্রবাহ (Sales Analytics Trend)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              MongoDB Aggregation Pipeline ($match, $group, $sum) দ্বারা রিয়েল-টাইম ক্যালকুলেটেড
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-emerald-800">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              বিক্রয় (টাকা)
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-600">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              অর্ডার সংখ্যা
            </span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full overflow-hidden bg-[#FAF9F5] rounded-2xl p-3 border border-[#E8E2D5]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-48 sm:h-56 overflow-visible"
          >
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = paddingY + ratio * chartH;
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[9px] fill-slate-400 font-mono font-bold"
                  >
                    ৳{Math.round((1 - ratio) * maxRevenue)}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaPath && <path d={areaPath} fill="url(#salesGrad)" />}

            {/* Main Trend Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#0F3D2E"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Nodes */}
            {points.map((p, idx) => (
              <g
                key={idx}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer group"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5.5"
                  className="fill-[#F59E0B] stroke-[#0F3D2E] stroke-2 hover:r-7 transition-all"
                />
                <text
                  x={p.x}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-600 font-bold"
                >
                  {p.day}
                </text>
              </g>
            ))}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredPoint && (
            <div className="absolute top-3 right-3 bg-[#0F3D2E] text-white p-2.5 rounded-xl shadow-xl text-xs space-y-0.5 border border-amber-400/30 animate-in fade-in">
              <div className="font-bold text-amber-400">{hoveredPoint.date} ({hoveredPoint.day})</div>
              <div>বিক্রয়: <strong>৳{hoveredPoint.revenue.toLocaleString('bn-BD')}</strong></div>
              <div className="text-emerald-300">অর্ডার সংখ্যা: <strong>{hoveredPoint.orders} টি</strong></div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Best-Selling Products vs Stagnant Inventory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Widget A: Best-Selling Products */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D5] shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm text-[#0F3D2E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
              <span>টপ-সেলিং পণ্য (Best-Selling Items)</span>
            </h4>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              শীর্ষ মুভিং স্টক
            </span>
          </div>

          <div className="space-y-3">
            {bestSellingProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">এখনো বিক্রয় ডাটা নেই</p>
            ) : (
              bestSellingProducts.slice(0, 5).map((prod, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FDFBF7] hover:bg-emerald-50/40 border border-[#E8E2D5] transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 line-clamp-1">{prod._id}</div>
                      <div className="text-[10px] text-slate-500">
                        {prod.orderCount} টি অর্ডারে বিক্রয় হয়েছে
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-[#0F3D2E]">
                      ৳{prod.totalRevenue?.toLocaleString('bn-BD')}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-700">
                      {prod.totalQuantity} টি ডেলিভার্ড
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget B: Stagnant Inventory (Low Movement) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D5] shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm text-[#0F3D2E] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>ধীরগতির বা স্তূপীকৃত স্টক (Stagnant Stock)</span>
            </h4>
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
              অফার/প্রচার আবশ্যক
            </span>
          </div>

          <div className="space-y-3">
            {stagnantProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">কোনো স্তূপীকৃত পণ্য নেই, স্টক সুষম আছে</p>
            ) : (
              stagnantProducts.map((prod, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FDFBF7] hover:bg-amber-50/40 border border-[#E8E2D5] transition-all text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 line-clamp-1">{prod.name}</div>
                    <div className="text-[10px] text-slate-400">{prod.categoryName || 'পণ্য'}</div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-900">৳{prod.price}</div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      অবশিষ্ট স্টক: {prod.stock} টি
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
