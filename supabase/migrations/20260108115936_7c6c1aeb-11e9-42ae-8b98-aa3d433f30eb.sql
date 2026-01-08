-- Add specs column to products table (JSONB for flexible key-value pairs)
ALTER TABLE public.products 
ADD COLUMN specs jsonb DEFAULT '{}'::jsonb;