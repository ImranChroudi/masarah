# إدارة المنتجات (Masarah Products)

تطبيق Next.js + Supabase لإدارة المنتجات (عربي بالكامل).

## الإعداد

1. تثبيت الحزم:
   ```bash
   npm install
   ```

2. إنشاء مشروع Supabase وتنفيذ ملف `supabase/schema.sql` في محرر SQL.

3. تحديث `.env.local`:
   ```
   APP_PASSWORD=masarah123
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
   ```

4. تشغيل:
   ```bash
   npm run dev
   ```

5. تسجيل الدخول بكلمة المرور: `masarah123`

## الميزات

- CRUD للمنتجات (القطعة، الثمن، المقاييس، اللون، ملاحظة، صورة)
- تغيير حجم الصورة تلقائياً إلى 60% من العرض (جودة 0.9)
- تصدير PDF (جدول со всех المنتجات)
- مصادقة بكلمة مرور فقط (بدون Supabase Auth)