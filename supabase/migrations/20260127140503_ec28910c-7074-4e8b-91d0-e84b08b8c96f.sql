-- Add media_urls column to store multiple images and videos
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS media_urls text[] DEFAULT '{}'::text[];