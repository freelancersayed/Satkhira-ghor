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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF0D4] hover:bg-[#E5A93C] text-[#102E25] rounded-xl text-xs font-black shadow-md border-2 border-[#1B4D3E]/30 transition-all hover:scale-105 group z-20"
      >
        <Edit3 className="w-3.5 h-3.5 text-[#1B4D3E] group-hover:rotate-12 transition-transform" />
        <span>এডিট করুন</span>
        <span className="bg-[#1B4D3E] text-[#FAF0D4] text-[9px] px-1 py-0.5 rounded-full font-bold">
          Admin
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#EFE9DC] shadow-2xl my-8 space-y-4">

            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#EFE9DC]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1B4D3E] text-[#E5A93C] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1B4D3E]">{sectionTitle}</h3>
                  <p className="text-[11px] text-[#8C9C93]">সরাসরি লাইভ সাইটে লেখা ও ছবি পরিবর্তন করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[#8C9C93] hover:text-[#102E25] hover:bg-gray-100"
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
                  <label className="block font-bold text-[#1B4D3E] mb-1">{field.label}</label>

                  {/* TEXTAREA */}
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={field.rows || 3}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      placeholder={field.placeholder || ''}
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE9DC] text-[#102E25] outline-none focus:border-[#1B4D3E] bg-[#FAF8F4]"
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
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE9DC] text-[#102E25] outline-none focus:border-[#1B4D3E] bg-[#FAF8F4]"
                    />
                  )}
                </div>
              ))}

              {/* Footer buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#EFE9DC]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#EFE9DC] text-[#4A5B53] font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#1B4D3E] hover:bg-[#153D31] text-[#FAF0D4] rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
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
