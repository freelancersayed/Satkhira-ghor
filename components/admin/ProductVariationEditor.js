'use client';

import { Plus, Trash2, Layers } from 'lucide-react';

export default function ProductVariationEditor({ hasVariations, variations = [], onChange }) {
  const handleToggle = (checked) => {
    onChange({
      hasVariations: checked,
      variations: checked && variations.length === 0 ? [createEmptyVariation()] : variations,
    });
  };

  const createEmptyVariation = () => ({
    sku: `SKU-${Date.now().toString().slice(-4)}`,
    size: '১ কেজি (1 kg)',
    color: '',
    weight: '1000g',
    price: 1250,
    originalPrice: null,
    stock: 20,
  });

  const handleAddVariation = () => {
    onChange({
      hasVariations: true,
      variations: [...variations, createEmptyVariation()],
    });
  };

  const handleRemoveVariation = (index) => {
    const updated = variations.filter((_, i) => i !== index);
    onChange({
      hasVariations: updated.length > 0,
      variations: updated,
    });
  };

  const handleUpdateField = (index, field, value) => {
    const updated = variations.map((v, i) => {
      if (i === index) {
        return {
          ...v,
          [field]: field === 'price' || field === 'stock' || field === 'originalPrice'
            ? value === '' ? '' : Number(value)
            : value,
        };
      }
      return v;
    });
    onChange({ hasVariations, variations: updated });
  };

  return (
    <div className="border border-[#E8E2D5] rounded-2xl p-4 bg-[#FDFBF7] space-y-3">
      <div className="flex justify-between items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!hasVariations}
            onChange={(e) => handleToggle(e.target.checked)}
            className="w-4 h-4 accent-[#0F3D2E] rounded"
          />
          <span className="font-bold text-xs text-[#0F3D2E] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>বহুমাত্রিক ভ্যারিয়েশন ম্যাট্রিক্স (Size / Weight / Color / SKU) সক্রিয় করুন</span>
          </span>
        </label>

        {hasVariations && (
          <button
            type="button"
            onClick={handleAddVariation}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন ভ্যারিয়েশন যোগ</span>
          </button>
        )}
      </div>

      {hasVariations && (
        <div className="space-y-2">
          <p className="text-[11px] text-slate-500">
            প্রতিটি সাইজ, ওজন বা রঙের জন্য আলাদা মূল্য, স্টক এবং SKU নির্ধারণ করুন:
          </p>

          <div className="overflow-x-auto max-h-60 overflow-y-auto border border-[#E8E2D5] rounded-xl bg-white">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#FAF9F5] text-slate-700 font-bold border-b border-[#E8E2D5]">
                <tr>
                  <th className="p-2">SKU</th>
                  <th className="p-2">সাইজ / পরিমাপ</th>
                  <th className="p-2">ওজন (গ্রাম)</th>
                  <th className="p-2">মূল্য (৳)</th>
                  <th className="p-2">স্টক</th>
                  <th className="p-2 text-right">মুছুন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {variations.map((v, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/20">
                    <td className="p-2">
                      <input
                        type="text"
                        value={v.sku || ''}
                        onChange={(e) => handleUpdateField(idx, 'sku', e.target.value)}
                        placeholder="SKU-01"
                        className="w-20 px-1.5 py-1 rounded border border-[#E8E2D5] font-mono text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={v.size || ''}
                        onChange={(e) => handleUpdateField(idx, 'size', e.target.value)}
                        placeholder="যেমন: ১ কেজি"
                        className="w-24 px-1.5 py-1 rounded border border-[#E8E2D5] text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={v.weight || ''}
                        onChange={(e) => handleUpdateField(idx, 'weight', e.target.value)}
                        placeholder="1000g"
                        className="w-16 px-1.5 py-1 rounded border border-[#E8E2D5] text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={v.price ?? ''}
                        onChange={(e) => handleUpdateField(idx, 'price', e.target.value)}
                        placeholder="1250"
                        className="w-20 px-1.5 py-1 rounded border border-[#E8E2D5] font-bold text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={v.stock ?? ''}
                        onChange={(e) => handleUpdateField(idx, 'stock', e.target.value)}
                        placeholder="20"
                        className="w-16 px-1.5 py-1 rounded border border-[#E8E2D5] text-xs"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariation(idx)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
