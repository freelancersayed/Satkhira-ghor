'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Edit3, Check, X, Save, Upload, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSiteContentStore } from '@/store/siteContentStore';
import ImageUploadInput from '@/components/common/ImageUploadInput';

export default function AdminSectionEditModal({
  sectionKey,
  sectionTitle = 'সেকশন এডিট করুন',
  fields = [],
}) {
  const { user } = useAuthStore();
  const { content, updateSection } = useSiteContentStore();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  const [uploading, setUploading] = useState(''); // field name being uploaded

  const fileRefs = useRef({});

  // Only admins can see and edit
  if (!user || user.role !== 'admin') return null;

  const handleOpen = () => {
    const currentData = content[sectionKey] || {};
    const initial = {};
    fields.forEach((field) => {
      initial[field.name] = currentData[field.name] || field.defaultValue || '';
    });
    setFormData(initial);
    setIsOpen(true);
    setNotification('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSection(sectionKey, formData);
      setNotification('সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => {
        setIsOpen(false);
        setNotification('');
      }, 800);
    } catch (err) {
      alert('সংরক্ষণ করা যায়নি: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle direct file upload for an image field
  const handleFileUpload = async (fieldName, file) => {
    if (!file) return;
    try {
      setUploading(fieldName);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'আপলোড ব্যর্থ');
      setFormData((prev) => ({ ...prev, [fieldName]: data.url }));
    } catch (err) {
      alert('আপলোড ব্যর্থ হয়েছে: ' + err.message);
    } finally {
      setUploading('');
    }
  };

  return (
    <>
      {/* Admin Edit Trigger */}
      <button
        onClick={handleOpen}
        type="button"
        title="এই সেকশনের লেখা বা ছবি পরিবর্তন করুন"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3C7] hover:bg-amber-200 text-[#0F3D2E] rounded-xl text-xs font-black shadow-md border-2 border-[#0F3D2E]/30 transition-all hover:scale-105 group z-20"
      >
        <Edit3 className="w-3.5 h-3.5 text-[#0F3D2E] group-hover:rotate-12 transition-transform" />
        <span>এডিট করুন</span>
        <span className="bg-[#0F3D2E] text-white text-[9px] px-1 py-0.5 rounded-full font-bold">
          Admin
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#E8E2D5] shadow-2xl my-8 space-y-4">

            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0F3D2E] text-[#F59E0B] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#0F3D2E]">{sectionTitle}</h3>
                  <p className="text-[11px] text-slate-400">সরাসরি লাইভ সাইটে লেখা ও ছবি পরিবর্তন করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success message */}
            {notification && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{notification}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block font-bold text-[#0F3D2E] mb-1">{field.label}</label>

                  {/* TEXTAREA */}
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={field.rows || 3}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.placeholder || ''}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] text-slate-900 outline-none focus:border-[#0F3D2E] bg-[#FDFBF7]"
                    />

                  /* IMAGE — Direct folder / gallery upload with ImageUploadInput */
                  ) : field.type === 'image' ? (
                    <ImageUploadInput
                      value={formData[field.name] || ''}
                      onChange={(url) => setFormData({ ...formData, [field.name]: url })}
                      label={field.label}
                      helpText="কম্পিউটার ফোল্ডার বা ফোন গ্যালারি থেকে যেকোনো ছবি নির্বাচন করুন"
                      allowUrlPaste={true}
                    />

                  /* DEFAULT text input */
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.placeholder || ''}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] text-slate-900 outline-none focus:border-[#0F3D2E] bg-[#FDFBF7]"
                    />
                  )}
                </div>
              ))}

              {/* Footer buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8E2D5]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E2D5] text-slate-600 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-black transition-all shadow-md hover:scale-[1.02] flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>পরিবর্তন সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
