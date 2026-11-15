'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import toast from 'react-hot-toast';

export interface Product {
  id?: string;
  name: string;
  price: number;
  sizes: string[];
  color: string;
  note: string;
  image_url: string | null;
}

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const targetWidth = Math.round(img.width * 0.6);
      const ratio = targetWidth / img.width;
      const targetHeight = Math.round(img.height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('canvas'));
        return;
      }
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('blob'));
        },
        'image/jpeg',
        0.9
      );
      URL.revokeObjectURL(url);
    };
    img.onerror = () => reject(new Error('img'));
    img.src = url;
  });
}

export default function ProductForm({
  initial,
  onSaved,
  onCancel
}: {
  initial?: Product | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [sizes, setSizes] = useState<string[]>(initial?.sizes || []);
  const [color, setColor] = useState(initial?.color || '');
  const [note, setNote] = useState(initial?.note || '');
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url || null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial?.image_url || null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (file) {
      const u = URL.createObjectURL(file);
      setPreview(u);
      return () => URL.revokeObjectURL(u);
    }
  }, [file]);
  const toggleSize = (s: string) => {
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!file) return imageUrl;
    try {
      const blob = await resizeImage(file);
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error } = await supabase.storage.from('product-images').upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: false
      });
      if (error) throw error;
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      return data.publicUrl;
    } catch (e: any) {
      toast.error('فشل رفع الصورة: ' + (e?.message || ''));
      return imageUrl;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error('لم يتم إعداد Supabase. الرجاء تحديث ملف .env.local');
      return;
    }
    if (!name.trim()) {
      toast.error('الرجاء إدخال اسم القطعة');
      return;
    }
    setSaving(true);
    try {
      const url = await uploadImage();
      const payload = {
        name: name.trim(),
        price: Number(price) || 0,
        sizes,
        color: color.trim(),
        note: note.trim(),
        image_url: url
      };
      if (initial?.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', initial.id);
        if (error) throw error;
        toast.success('تم تحديث المنتج');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        toast.success('تم إضافة المنتج');
      }
      onSaved();
    } catch (e: any) {
      toast.error('حدث خطأ: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 modal-backdrop">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <form onSubmit={submit} className="p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary-dark">
              {initial?.id ? 'تعديل المنتج' : 'إضافة منتج'}
            </h2>
            <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">صورة المنتج</label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-sm">لا توجد صورة</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">سيتم تغيير حجم الصورة تلقائياً إلى 60% من العرض الأصلي (جودة عالية).</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">القطعة</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-light focus:outline-none text-base"
              placeholder="اسم القطعة"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الثمن (درهم)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-light focus:outline-none text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">المقاييس</label>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={`touch-manipulation px-4 py-2.5 rounded-lg border text-sm font-medium transition min-h-[40px] ${
                    sizes.includes(s)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-light'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">اللون</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-light focus:outline-none text-base"
              placeholder="اللون"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ملاحظة</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-light focus:outline-none text-base"
              placeholder="ملاحظة"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="touch-manipulation flex-1 bg-primary hover:bg-primary-dark active:bg-plum text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 min-h-[48px]"
            >
              {saving ? 'جاري الحفظ...' : initial?.id ? 'تحديث' : 'إضافة'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="touch-manipulation flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition min-h-[48px]"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}