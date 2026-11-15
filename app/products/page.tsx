'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Product } from '@/components/ProductForm';
import ProductForm from '@/components/ProductForm';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      toast.error('لم يتم إعداد Supabase. الرجاء تحديث ملف .env.local');
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error('فشل تحميل المنتجات: ' + error.message);
    else setProducts((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error('فشل الحذف');
    else {
      toast.success('تم حذف المنتج');
      fetchProducts();
    }
  };

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    window.location.href = '/login';
  };

  const filtered = products.filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.color || '').toLowerCase().includes(search.toLowerCase())
  );

  const exportPDF = async () => {
    if (!printRef.current) return;
    setExporting(true);
    try {
      await (document as any).fonts?.ready;
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, allowTaint: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save('products.pdf');
      toast.success('تم تحميل PDF');
    } catch (e: any) {
      toast.error('فشل تصدير PDF: ' + (e?.message || ''));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <header className="bg-white shadow-sm no-print sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <img src="/logo.png" alt="شعار" className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl" />
              <h1 className="text-xl sm:text-2xl font-bold text-primary-dark text-center sm:text-right">
                إدارة المنتجات
              </h1>
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
              <button
                onClick={exportPDF}
                disabled={exporting}
                className="touch-manipulation bg-accent hover:bg-accent-dark active:bg-accent-dark text-white px-3 sm:px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50 text-sm sm:text-base min-h-[44px]"
              >
                {exporting ? 'جاري التصدير...' : 'تصدير PDF'}
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setShowForm(true);
                }}
                className="touch-manipulation bg-primary hover:bg-primary-dark active:bg-plum text-white px-3 sm:px-4 py-2.5 rounded-lg font-medium transition text-sm sm:text-base min-h-[44px]"
              >
                + إضافة منتج
              </button>
              <button
                onClick={logout}
                className="touch-manipulation bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 px-3 sm:px-4 py-2.5 rounded-lg font-medium transition text-sm sm:text-base min-h-[44px]"
              >
                خروج
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="no-print mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن منتج..."
            className="w-full sm:w-2/3 md:w-1/3 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-light focus:outline-none text-base"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-12">جاري التحميل...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-12">لا توجد منتجات</p>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 no-print">
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="w-full h-48 sm:h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-gray-400 text-sm">لا توجد صورة</span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-base sm:text-lg font-bold leading-tight">{p.name}</h3>
                  <p className="text-primary-dark font-semibold text-base sm:text-lg">{p.price} درهم</p>
                  {p.sizes?.length ? (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">المقاييس: </span>
                      {p.sizes.join('، ')}
                    </p>
                  ) : null}
                  {p.color ? (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">اللون: </span>
                      {p.color}
                    </p>
                  ) : null}
                  {p.note ? <p className="text-sm text-gray-500 line-clamp-2">{p.note}</p> : null}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setShowForm(true);
                      }}
                      className="touch-manipulation flex-1 bg-accent hover:bg-accent-dark active:bg-accent-dark text-white py-2.5 rounded-lg text-sm font-medium transition min-h-[44px]"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="touch-manipulation flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white py-2.5 rounded-lg text-sm font-medium transition min-h-[44px]"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Off-screen area captured for PDF export */}
        <div
          ref={printRef}
          className="bg-white p-6"
          style={{ position: 'absolute', left: '-10000px', top: 0, width: '794px' }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center">قائمة المنتجات</h2>
          <table className="w-full border-collapse text-sm" dir="rtl">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">الصورة</th>
                <th className="border p-2">القطعة</th>
                <th className="border p-2">الثمن (درهم)</th>
                <th className="border p-2">المقاييس</th>
                <th className="border p-2">اللون</th>
                <th className="border p-2">ملاحظة</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="border p-2">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} crossOrigin="anonymous" style={{ width: 60, height: 60, objectFit: 'cover' }} />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border p-2">{p.name}</td>
                  <td className="border p-2">{p.price}</td>
                  <td className="border p-2">{(p.sizes || []).join('، ')}</td>
                  <td className="border p-2">{p.color}</td>
                  <td className="border p-2">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showForm && (
        <ProductForm
          initial={editing}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            fetchProducts();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}