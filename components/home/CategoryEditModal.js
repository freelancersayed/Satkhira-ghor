'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  FolderPlus,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  Loader2,
  Sparkles,
  Check,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSiteContentStore } from '@/store/siteContentStore';

export default function CategoryEditModal({ onCategoriesUpdated }) {
  const { user } = useAuthStore();
  const { content, updateSection } = useSiteContentStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add'
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingSlug, setUploadingSlug] = useState(null);
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // New Category Form State
  const [newCat, setNewCat] = useState({
    name: '',
    nameEn: '',
    slug: '',
    icon: '🌿',
    image: '',
    description: '',
  });
  const [uploadingNewImage, setUploadingNewImage] = useState(false);
  const newFileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const activeEditSlugRef = useRef(null);

  // Only admins can see and edit
  if (!user || user.role !== 'admin') return null;

  const handleOpen = () => {
    // Read categories from siteContentStore or fetch
    const current = Array.isArray(content?.categories) && content.categories.length > 0
      ? content.categories
      : [];
    setCategoriesList(current);
    setNotification('');
    setErrorMsg('');
    setActiveTab('list');
    setIsOpen(true);
    fetchLatestCategories();
  };

  const fetchLatestCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) {
        setCategoriesList(data.categories);
      }
    } catch (e) {
      console.warn('Failed to fetch categories:', e);
    } finally {
      setLoading(false);
    }
  };

  // Upload single file helper via /api/upload
  const uploadImageFile = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'ছবি আপলোড ব্যর্থ হয়েছে');
    return data.url;
  };

  // Handle image upload for an existing category
  const handleEditImageUpload = async (e) => {
    const file = e.target.files?.[0];
    const slug = activeEditSlugRef.current;
    if (!file || !slug) return;

    try {
      setUploadingSlug(slug);
      setErrorMsg('');
      const url = await uploadImageFile(file);
      if (url) {
        // Update local list
        const updated = categoriesList.map((c) => (c.slug === slug ? { ...c, image: url } : c));
        setCategoriesList(updated);

        // Save to DB
        await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, image: url }),
        });

        // Update global store
        updateSection('categories', updated);
        if (onCategoriesUpdated) onCategoriesUpdated(updated);

        setNotification('ছবি সফলভাবে পরিবর্তন ও সেভ হয়েছে!');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'ছবি আপলোড ব্যর্থ');
    } finally {
      setUploadingSlug(null);
      e.target.value = '';
    }
  };

  // Handle image upload for new category
  const handleNewImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingNewImage(true);
      setErrorMsg('');
      const url = await uploadImageFile(file);
      if (url) {
        setNewCat((prev) => ({ ...prev, image: url }));
        setNotification('নতুন ক্যাটাগরির ছবি আপলোড সম্পন্ন!');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'ছবি আপলোড ব্যর্থ');
    } finally {
      setUploadingNewImage(false);
      e.target.value = '';
    }
  };

  // Update a single category field in local state
  const handleFieldChange = (slug, field, value) => {
    setCategoriesList((prev) =>
      prev.map((c) => (c.slug === slug ? { ...c, [field]: value } : c))
    );
  };

  // Save changes to an existing category
  const handleSaveCategory = async (cat) => {
    try {
      setErrorMsg('');
      setLoading(true);
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'আপডেট ব্যর্থ');

      updateSection('categories', data.categories || categoriesList);
      if (onCategoriesUpdated) onCategoriesUpdated(data.categories || categoriesList);

      setNotification(`"${cat.name}" সফলভাবে আপডেট করা হয়েছে!`);
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (slug, name) => {
    if (slug === 'all') {
      alert('"সব পণ্য" ক্যাটাগরি ডিলিট করা সম্ভব নয়');
      return;
    }
    if (!confirm(`আপনি কি নিশ্চিত যে "${name}" ক্যাটাগরি ডিলিট করতে চান?`)) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/categories?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ডিলিট ব্যর্থ');

      setCategoriesList(data.categories);
      updateSection('categories', data.categories);
      if (onCategoriesUpdated) onCategoriesUpdated(data.categories);

      setNotification(`"${name}" ক্যাটাগরি সফলভাবে ডিলিট করা হয়েছে!`);
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit New Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) {
      setErrorMsg('ক্যাটাগরির বাংলা নাম লিখুন');
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

      setCategoriesList(data.categories);
      updateSection('categories', data.categories);
      if (onCategoriesUpdated) onCategoriesUpdated(data.categories);

      setNotification(`নতুন ক্যাটাগরি "${newCat.name}" সফলভাবে যুক্ত হয়েছে!`);
      setNewCat({
        name: '',
        nameEn: '',
        slug: '',
        icon: '🌿',
        image: '',
        description: '',
      });
      setActiveTab('list');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Trigger Button for Admin ── */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#016831] text-white hover:bg-[#015629] text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
        title="ক্যাটাগরি যোগ ও ছবি এডিট করুন"
      >
        <FolderPlus className="w-3.5 h-3.5 text-[#F59E0B]" />
        <span>ক্যাটাগরি ম্যানেজ</span>
      </button>

      {/* Hidden File Input for Editing Category Image */}
      <input
        ref={editFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleEditImageUpload}
        className="hidden"
      />

      {/* ── Admin Category Management Modal ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E2D5] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#016831] text-white px-5 py-4 flex items-center justify-between border-b border-emerald-900">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#F59E0B]">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>ডাইনামিক ক্যাটাগরি কন্ট্রোল</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F59E0B] text-slate-950 font-black">
                      এডমিন
                    </span>
                  </h3>
                  <p className="text-[11px] text-white/70">
                    নতুন ক্যাটাগরি যোগ করুন, বিদ্যমান ক্যাটাগরির লোগো/ছবি পরিবর্তন করুন
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification & Error Bar */}
            {notification && (
              <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{notification}</span>
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-600 text-white text-xs px-4 py-2 font-bold flex items-center justify-between">
                <span>{errorMsg}</span>
                <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-2 px-5 pt-3 bg-white border-b border-[#E8E2D5]">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'list'
                    ? 'border-[#016831] text-[#016831]'
                    : 'border-transparent text-[#8E9C96] hover:text-[#016831]'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>ক্যাটাগরি তালিকা ও ছবি পরিবর্তন ({categoriesList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('add')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'add'
                    ? 'border-[#016831] text-[#016831]'
                    : 'border-transparent text-[#8E9C96] hover:text-[#016831]'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-[#D97706]" />
                <span>নতুন ক্যাটাগরি যোগ করুন</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: CATEGORIES LIST & IMAGE EDITING */}
              {activeTab === 'list' && (
                <div className="space-y-3">
                  <p className="text-xs text-[#56625D]">
                    💡 প্রতিটি ক্যাটাগরির ছবি সরাসরি পরিবর্তন করতে <strong>&ldquo;ছবি পরিবর্তন&rdquo;</strong> বাটনে ক্লিক করে ফাইল আপলোড করুন:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {categoriesList.map((cat) => {
                      const isUploadingThis = uploadingSlug === cat.slug;
                      return (
                        <div
                          key={cat.slug || cat.id}
                          className="bg-white p-3.5 rounded-2xl border border-[#E8E2D5] shadow-xs flex flex-col justify-between space-y-3"
                        >
                          <div className="flex items-start gap-3">
                            {/* Category Image with Change Button */}
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-[#E8E2D5] group/img">
                              {cat.image ? (
                                <Image
                                  src={cat.image}
                                  alt={cat.name}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                  {cat.icon || '🌿'}
                                </div>
                              )}

                              {/* Upload Overlay Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  activeEditSlugRef.current = cat.slug;
                                  editFileInputRef.current?.click();
                                }}
                                disabled={isUploadingThis}
                                className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                title="নতুন ছবি আপলোড করুন"
                              >
                                {isUploadingThis ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mb-0.5" />
                                    <span>ছবি পাল্টান</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Info & Fields */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={cat.icon || ''}
                                  onChange={(e) => handleFieldChange(cat.slug, 'icon', e.target.value)}
                                  placeholder="আইকন"
                                  className="w-10 px-1 py-1 text-center text-sm border rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                                  title="ইমোজি বা আইকন"
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
                                placeholder="ছবির URL লিঙ্ক"
                                className="w-full px-2.5 py-1 text-[10px] border rounded-lg bg-[#FAF8F5] text-stone-500 focus:outline-none focus:border-[#016831] truncate"
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#F0EBE1] text-xs">
                            <span className="text-[10px] text-[#8E9C96] font-mono">
                              /{cat.slug}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveCategory(cat)}
                                disabled={loading}
                                className="px-3 py-1 rounded-lg bg-[#016831] text-white hover:bg-[#015629] text-[11px] font-bold flex items-center gap-1 transition-colors"
                              >
                                <Save className="w-3 h-3" />
                                <span>সেভ</span>
                              </button>

                              {cat.slug !== 'all' && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat.slug, cat.name)}
                                  disabled={loading}
                                  className="p-1 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                                  title="ক্যাটাগরি ডিলিট করুন"
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
                </div>
              )}

              {/* TAB 2: ADD NEW CATEGORY */}
              {activeTab === 'add' && (
                <form onSubmit={handleCreateCategory} className="bg-white p-5 rounded-2xl border border-[#E8E2D5] space-y-4 max-w-xl mx-auto">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#E8E2D5]">
                    <Plus className="w-5 h-5 text-[#D97706]" />
                    <h4 className="text-sm font-bold text-[#016831]">নতুন ক্যাটাগরির তথ্য পূরণ করুন</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#016831] mb-1">
                        ক্যাটাগরির বাংলা নাম *
                      </label>
                      <input
                        type="text"
                        required
                        value={newCat.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewCat((prev) => ({
                            ...prev,
                            name: val,
                            slug: prev.slug ? prev.slug : val.toLowerCase().replace(/\s+/g, '-'),
                          }));
                        }}
                        placeholder="যেমন: খাঁটি খেজুর ও বাদাম"
                        className="w-full px-3 py-2 text-xs border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#016831] mb-1">
                        ইংরেজি নাম (English)
                      </label>
                      <input
                        type="text"
                        value={newCat.nameEn}
                        onChange={(e) => setNewCat({ ...newCat, nameEn: e.target.value })}
                        placeholder="e.g. Dates & Nuts"
                        className="w-full px-3 py-2 text-xs border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#016831] mb-1">
                        স্লাগ (URL Slug) *
                      </label>
                      <input
                        type="text"
                        required
                        value={newCat.slug}
                        onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
                        placeholder="e.g. dates-and-nuts"
                        className="w-full px-3 py-2 text-xs border rounded-xl bg-[#FAF8F5] font-mono focus:outline-none focus:border-[#016831]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#016831] mb-1">
                        আইকন / ইমোজি
                      </label>
                      <input
                        type="text"
                        value={newCat.icon}
                        onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
                        placeholder="🌴, 🍯, 🧈 ইত্যাদি"
                        className="w-full px-3 py-2 text-xs border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                      />
                    </div>
                  </div>

                  {/* Image Upload Area */}
                  <div>
                    <label className="block text-xs font-bold text-[#016831] mb-1">
                      ক্যাটাগরির ছবি / লোগো
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-[#E8E2D5] flex-shrink-0">
                        {newCat.image ? (
                          <Image
                            src={newCat.image}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl text-stone-400">
                            {newCat.icon || '📷'}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
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
                          <span>কম্পিউটার/মোবাইল থেকে আপলোড</span>
                        </button>

                        <input
                          type="text"
                          value={newCat.image}
                          onChange={(e) => setNewCat({ ...newCat, image: e.target.value })}
                          placeholder="অথবা সরাসরি ছবির URL লিঙ্ক দিন"
                          className="w-full px-3 py-1.5 text-xs border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#016831] mb-1">
                      সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)
                    </label>
                    <textarea
                      rows={2}
                      value={newCat.description}
                      onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                      placeholder="ক্যাটাগরির সংক্ষিপ্ত বিবরণ..."
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={loading || uploadingNewImage}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      <span>ক্যাটাগরি যুক্ত করুন</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-white px-5 py-3 border-t border-[#E8E2D5] flex items-center justify-between text-xs text-stone-500">
              <span>মোট ক্যাটাগরি: {categoriesList.length} টি</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#E8E2D5] text-[#016831] font-bold transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
