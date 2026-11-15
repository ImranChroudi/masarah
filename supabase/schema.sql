-- Run this in your Supabase SQL editor

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null default 0,
  sizes text[] default '{}',
  color text,
  note text,
  image_url text,
  created_at timestamptz default now()
);

-- Storage bucket for product images (create via dashboard or below)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow public read on bucket
create policy "public read product images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "public upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images');

create policy "public update product images"
on storage.objects for update
using (bucket_id = 'product-images');

create policy "public delete product images"
on storage.objects for delete
using (bucket_id = 'product-images');

-- RLS on products (open for anon since auth is app-level)
alter table products enable row level security;
create policy "anon all products" on products for all using (true) with check (true);