'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertTriangle, Download, Trash2 } from 'lucide-react';

export default function BulkProductUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [fileData, setFileData] = useState([]);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Simple CSV parser
  const parseCSV = (csvText) => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) throw new Error('CSV ফাইলে অন্তত হেডার ও একটি ডাটা সারি থাকা আবশ্যক');

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const parsed = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] !== undefined ? values[idx] : '';
        });

        if (obj.name && obj.price) {
          parsed.push({
            name: obj.name,
            nameEn: obj.nameEn || '',
            category: obj.category || 'honey',
            categoryName: obj.categoryName || 'সুন্দরবনের মধু',
            price: Number(obj.price) || 0,
            originalPrice: obj.originalPrice ? Number(obj.originalPrice) : null,
            unit: obj.unit || '১ কেজি',
            stock: obj.stock !== undefined ? Number(obj.stock) : 20,
            image: obj.image || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38',
            shortDescription: obj.shortDescription || '',
          });
        }
      }

      return parsed;
    } catch (e) {
      throw new Error('CSV পার্সিং ত্রুটি: ' + e.message);
    }
  };

  const handleFileUpload = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        setRawText(content);
        const parsed = parseCSV(content);
        setFileData(parsed);
      } catch (err) {
        setError(err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleParseText = () => {
    setError('');
    try {
      if (rawText.trim().startsWith('[')) {
        // JSON format
        const parsed = JSON.parse(rawText);
        setFileData(parsed);
      } else {
        // CSV format
        const parsed = parseCSV(rawText);
        setFileData(parsed);
      }
    } catch (e) {
      setError(e.message || 'ডাটা ফরম্যাট সঠিক নয়');
    }
  };

  const handleDownloadSample = () => {
    const sampleHeaders = 'name,nameEn,category,categoryName,price,originalPrice,unit,stock,image,shortDescription\n';
    const sampleRow1 = '"সুন্দরবনের খলিসা মধু","Sundarbans Kholisa Raw Honey","honey","সুন্দরবনের মধু",1450,1650,"১ কেজি",35,"https://images.unsplash.com/photo-1587049352846-4a222e784d38","শতভাগ প্রাকৃতিক ও ফিল্টারহীন খলিসা ফুলের খাঁটি মধু"\n';
    const sampleRow2 = '"খাঁটি গাওয়া ঘি","Pure Hand-churned Desi Ghee","ghee","খাঁটি গাওয়া ঘি",1800,2000,"১ কেজি",15,"https://images.unsplash.com/photo-1628088062854-d1870b4553da","ঘাসের গরুর দুধে তৈরি দেশি গাওয়া ঘি"\n';

    const blob = new Blob([sampleHeaders + sampleRow1 + sampleRow2], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'satkhira-ghor-product-sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteUpload = async () => {
    if (fileData.length === 0) {
      setError('আপলোড করার জন্য কোনো পণ্য পাওয়া যায়নি');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: fileData }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'বাল্ক আপলোড ব্যর্থ হয়েছে');
      }

      onUploadSuccess(data.count || fileData.length);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#E8E2D5] shadow-2xl my-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-[#0F3D2E]">
              বাল্ক পণ্য আপলোড (Bulk CSV / Excel Import)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Controls & Sample Download */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="border-2 border-dashed border-[#0F3D2E] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-50/50 transition-colors">
            <Upload className="w-6 h-6 text-[#0F3D2E] mb-1" />
            <span className="text-xs font-bold text-[#0F3D2E]">
              কম্পিউটার থেকে CSV ফাইল আপলোড করুন
            </span>
            <span className="text-[10px] text-slate-400">.csv বা টেক্সট ফাইল</span>
            <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <div className="border border-[#E8E2D5] rounded-2xl p-4 flex flex-col justify-between bg-[#FDFBF7]">
            <div>
              <div className="font-bold text-xs text-slate-800">নমুনা ফাইল ডাউনলোড</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                হেডার কলাম ঠিক রেখে দ্রুত পণ্য তালিকা তৈরি করতে নমুনা CSV ফাইলটি ব্যবহার করুন।
              </p>
            </div>
            <button
              onClick={handleDownloadSample}
              className="mt-2 px-3 py-1.5 bg-[#0F3D2E] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#15533f]"
            >
              <Download className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>নমুনা CSV নামিয়ে নিন</span>
            </button>
          </div>
        </div>

        {/* Or Paste CSV/JSON text */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            অথবা সরাসরি CSV বা JSON ডাটা পেস্ট করুন:
          </label>
          <textarea
            rows={3}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="name,price,category,stock,image..."
            className="w-full p-2.5 rounded-xl border border-[#E8E2D5] text-xs font-mono outline-none"
          />
          <div className="flex justify-end mt-1">
            <button
              type="button"
              onClick={handleParseText}
              className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold"
            >
              ডাটা পার্স করুন
            </button>
          </div>
        </div>

        {/* Parsed Preview Table */}
        {fileData.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#0F3D2E]">
                মোট {fileData.length} টি পণ্য পাওয়া গেছে (প্রিভিউ):
              </span>
              <button
                onClick={() => setFileData([])}
                className="text-red-600 hover:underline text-[11px]"
              >
                সব মুছুন
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto border border-[#E8E2D5] rounded-xl overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#FDFBF7] text-slate-700 font-bold border-b border-[#E8E2D5]">
                  <tr>
                    <th className="p-2">পণ্যের নাম</th>
                    <th className="p-2">ক্যাটাগরি</th>
                    <th className="p-2">মূল্য</th>
                    <th className="p-2">স্টক</th>
                    <th className="p-2 text-right">রিমুভ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D5]">
                  {fileData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/20">
                      <td className="p-2 font-bold text-slate-900">{item.name}</td>
                      <td className="p-2 text-slate-600">{item.categoryName || item.category}</td>
                      <td className="p-2 font-bold text-[#0F3D2E]">৳{item.price}</td>
                      <td className="p-2">{item.stock} টি</td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => setFileData(fileData.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E2D5]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E8E2D5] text-slate-600 font-bold text-xs"
          >
            বাতিল
          </button>
          <button
            type="button"
            disabled={loading || fileData.length === 0}
            onClick={handleExecuteUpload}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span>ডাটাবেজে যুক্ত হচ্ছে...</span>
            ) : (
              <span>{fileData.length} টি পণ্য ডাটাবেজে সংরক্ষণ করুন (insertMany)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
