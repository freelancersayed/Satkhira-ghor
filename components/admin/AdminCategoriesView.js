'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  FolderPlus,
  Plus,
  Trash2,
  Save,
  Upload,
  Loader2,
  Check,
  X,
  Search,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useSiteContentStore } from '@/store/siteContentStore';

export default function AdminCategoriesView() {
  const { content, updateSection } = useSiteContentStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingSlug, setUploadingSlug] = useState(null);
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');

  // Add Category Form State
  const [newCatModalOpen, setNewCatModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({
    name: '',
    nameEn: '',
    slug: '',
    icon: '🌿',
    image: '',
    description: '',
  });
  const [uploadingNewImage, setUploadingNewImage] = useState(false);

  const editFileInputRef = useRef(null);
  const activeEditSlugRef = useRef(null);
  const newFileInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.warn('Failed to fetch categories:', e);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'আপলোড ব্যর্থ');
    return data.url;
  };

  const handleEditImageUpload = async (e) => {
    const file = e.target.files?.[0];
    const slug = activeEditSlugRef.current;
    if (!file || !slug) return;

    try {
      setUploadingSlug(slug);
      setErrorMsg('');
      const url = await uploadFile(file);
      if (url) {
        const updated = categories.map((c) => (c.slug === slug ? { ...c, image: url } : c));
        setCategories(updated);

        await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, image: url }),
        });

        updateSection('categories', updated);
        setNotification('ছবি সফলভাবে পরিবর্তন ও সংরক্ষণ হয়েছে!');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'ছবি আপলোড ব্যর্থ');
    } finally {
      setUploadingSlug(null);
      e.target.value = '';
    }
  };

  const handleNewImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingNewImage(true);
      setErrorMsg('');
      const url = await uploadFile(file);
      if (url) {
        setNewCat((prev) => ({ ...prev, image: url }));
        setNotification('ছবি সফলভাবে আপলোড হয়েছে!');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'ছবি আপলোড ব্যর্থ');
    } finally {
      setUploadingNewImage(false);
      e.target.value = '';
    }
  };

  const handleFieldChange = (slug, field, value) => {
    setCategories((prev) =>
      prev.map((c) => (c.slug === slug ? { ...c, [field]: value } : c))
    );
  };

  const handleSaveCategory = async (cat) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'আপডেট ব্যর্থ');

      updateSection('categories', data.categories);
      setNotification(`"${cat.name}" সফলভাবে আপডেট হয়েছে!`);
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (slug, name) => {
    if (slug === 'all') {
      alert('"সব পণ্য" ক্যাটাগরি ডিলিট করা সম্ভব নয়');
      return;
    }
    if (!confirm(`আপনি কি নিশ্চিত যে "${name}" ক্যাটাগরি ডিলিট করবেন?`)) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/categories?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ডিলিট ব্যর্থ');

      setCategories(data.categories);
      updateSection('categories', data.categories);
      setNotification(`"${name}" ক্যাটাগরি ডিলিট সম্পন্ন!`);
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) {
      setErrorMsg('ক্যাটাগরির বাংলা নাম আবশ্যক');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ক্যাটাগরি তৈরি ব্যর্থ');

      setCategories(data.categories);
      updateSection('categories', data.categories);
      setNotification(`নতুন ক্যাটাগরি "${newCat.name}" সফলভাবে যুক্ত হয়েছে!`);
      setNewCatModalOpen(false);
      setNewCat({
        name: '',
        nameEn: '',
        slug: '',
        icon: '🌿',
        image: '',
        description: '',
      });
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    return (
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.nameEn?.toLowerCase().includes(search.toLowerCase()) ||
      c.slug?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={editFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleEditImageUpload}
        className="hidden"
      />

      {/* Header Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#E8E2D5] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#016831] flex items-center gap-2">
            <FolderPlus className="w-6 h-6 text-[#D97706]" />
            <span>ডাইনামিক ক্যাটাগরি ম্যানেজমেন্ট</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            নতুন ক্যাটাগরি যোগ করুন এবং প্রতিটি ক্যাটাগরির লোগো/ছবি ও তথ্য সরাসরি পরিবর্তন করুন
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ক্যাটাগরি খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
            />
          </div>

          <button
            type="button"
            onClick={() => setNewCatModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#016831] to-[#015629] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-[#F59E0B]" />
            <span>নতুন ক্যাটাগরি যোগ</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-600 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center justify-between shadow-sm animate-fadeIn">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => {
          const isUploading = uploadingSlug === cat.slug;
          return (
            <div
              key={cat.slug || cat.id}
              className="bg-white rounded-2xl border border-[#E8E2D5] shadow-xs hover:border-[#016831]/40 p-4 flex flex-col justify-between space-y-3 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Category Thumbnail with Upload Button */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 border border-[#E8E2D5] flex-shrink-0 group/thumb">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {cat.icon || '🌿'}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      activeEditSlugRef.current = cat.slug;
                      editFileInputRef.current?.click();
                    }}
                    disabled={isUploading}
                    className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold flex flex-col items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                    title="ছবি পরিবর্তন করুন"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mb-0.5" />
                        <span>ছবি পাল্টান</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Editable Fields */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={cat.icon || ''}
                      onChange={(e) => handleFieldChange(cat.slug, 'icon', e.target.value)}
                      placeholder="আইকন"
                      className="w-10 px-1 py-1 text-center text-sm border rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                      title="আইকন / ইমোজি"
                    />
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleFieldChange(cat.slug, 'name', e.target.value)}
                      placeholder="বাংলা নাম"
                      className="flex-1 px-2.5 py-1 text-xs font-bold border rounded-lg bg-[#FAF8F5] text-[#016831] focus:outline-none focus:border-[#016831]"
                    />
                  </div>

                  <input
                    type="text"
                    value={cat.nameEn || ''}
                    onChange={(e) => handleFieldChange(cat.slug, 'nameEn', e.target.value)}
                    placeholder="ইংরেজি নাম"
                    className="w-full px-2.5 py-1 text-[11px] border rounded-lg bg-[#FAF8F5] text-stone-600 focus:outline-none focus:border-[#016831]"
                  />

                  <input
                    type="text"
                    value={cat.image || ''}
                    onChange={(e) => handleFieldChange(cat.slug, 'image', e.target.value)}
                    placeholder="ছবির URL"
                    className="w-full px-2.5 py-1 text-[10px] border rounded-lg bg-[#FAF8F5] text-stone-500 focus:outline-none focus:border-[#016831] truncate"
                  />
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F0EBE1] text-xs">
                <span className="text-[10px] text-stone-400 font-mono">/{cat.slug}</span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveCategory(cat)}
                    disabled={loading}
                    className="px-3 py-1 rounded-lg bg-[#016831] text-white hover:bg-[#015629] text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    <span>সেভ</span>
                  </button>

                  {cat.slug !== 'all' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.slug, cat.name)}
                      disabled={loading}
                      className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="ক্যাটাগরি মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Category Modal */}
      {newCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D5]">
              <h3 className="text-base font-extrabold text-[#016831] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#D97706]" />
                <span>নতুন ক্যাটাগরি তৈরি করুন</span>
              </h3>
              <button
                type="button"
                onClick={() => setNewCatModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#016831] mb-1">ক্যাটাগরির বাংলা নাম *</label>
                  <input
                    type="text"
                    required
                    value={newCat.name}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNewCat((prev) => ({
                        ...prev,
                        name: v,
                        slug: prev.slug ? prev.slug : v.toLowerCase().replace(/\s+/g, '-'),
                      }));
                    }}
                    placeholder="যেমন: খাঁটি খেজুর ও বাদাম"
                    className="w-full px-3 py-2 border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#016831] mb-1">ইংরেজি নাম</label>
                  <input
                    type="text"
                    value={newCat.nameEn}
                    onChange={(e) => setNewCat({ ...newCat, nameEn: e.target.value })}
                    placeholder="Dates & Nuts"
                    className="w-full px-3 py-2 border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#016831] mb-1">স্লাগ (Slug) *</label>
                  <input
                    type="text"
                    required
                    value={newCat.slug}
                    onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
                    placeholder="dates-nuts"
                    className="w-full px-3 py-2 border rounded-xl bg-[#FAF8F5] font-mono focus:outline-none focus:border-[#016831]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#016831] mb-1">লোগো / আইকন</label>
                  <input
                    type="text"
                    value={newCat.icon}
                    onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
                    placeholder="🌴, 🍯, 🧈 ইত্যাদি"
                    className="w-full px-3 py-2 border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                  />
                </div>
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block font-bold text-[#016831] mb-1">ক্যাটাগরি ছবি / লোগো</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-[#E8E2D5] flex-shrink-0">
                    {newCat.image ? (
                      <Image src={newCat.image} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-stone-400">
                        {newCat.icon || '📷'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <input
                      ref={newFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleNewImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => newFileInputRef.current?.click()}
                      disabled={uploadingNewImage}
                      className="px-3.5 py-1.5 rounded-xl bg-[#016831] text-white hover:bg-[#015629] text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      {uploadingNewImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>ফাইল আপলোড করুন</span>
                    </button>
                    <input
                      type="text"
                      value={newCat.image}
                      onChange={(e) => setNewCat({ ...newCat, image: e.target.value })}
                      placeholder="বা ছবির URL দিন"
                      className="w-full px-2.5 py-1 text-xs border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#016831] mb-1">বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  placeholder="ক্যাটাগরির বিবরণ..."
                  className="w-full px-3 py-2 border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E8E2D5]">
                <button
                  type="button"
                  onClick={() => setNewCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 font-bold hover:bg-stone-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingNewImage}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-slate-950 font-black shadow-md flex items-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>ক্যাটাগরি যুক্ত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
