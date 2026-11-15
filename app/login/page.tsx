'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        toast.error('كلمة المرور غير صحيحة');
        return;
      }
      toast.success('تم تسجيل الدخول');
      router.push('/products');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-soft to-accent/20 p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <img src="/logo.png" alt="شعار" className="mx-auto mb-4 w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl shadow-md" />
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark">إدارة المنتجات</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">أدخل كلمة المرور للدخول</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">كلمة المرور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-light focus:outline-none text-base"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="touch-manipulation w-full bg-primary hover:bg-primary-dark active:bg-plum text-white font-semibold py-3.5 rounded-lg transition disabled:opacity-50 min-h-[48px] text-base"
        >
          {loading ? 'جاري الدخول...' : 'دخول'}
        </button>
      </form>
    </div>
  );
}