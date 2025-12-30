-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'essential',
  colors TEXT[] DEFAULT '{}',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable
CREATE POLICY "Products are publicly readable"
ON public.products
FOR SELECT
USING (true);

-- Only admins can insert products
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Only admins can update products
CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Only admins can delete products
CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial products
INSERT INTO public.products (name, description, price, original_price, image_url, category, colors, in_stock, featured, rating, reviews_count) VALUES
('iTag Pro', 'Premium precision tracking with extended range. Never lose your valuables again with our most advanced tracker.', 39.99, 49.99, '/products/itag-pro.png', 'premium', ARRAY['#1a1a1a', '#f5f5f7', '#0071e3', '#bf4040'], true, true, 4.9, 2847),
('iTag Mini', 'Compact design for everyday essentials. Perfect for keys, wallets, and small items.', 24.99, NULL, '/products/itag-mini.png', 'essential', ARRAY['#1a1a1a', '#f5f5f7', '#34c759'], true, true, 4.7, 1923),
('iTag Ultra', 'Military-grade durability meets premium tracking. Waterproof and shock-resistant.', 59.99, 79.99, '/products/itag-ultra.png', 'premium', ARRAY['#1a1a1a', '#3d5a80'], true, true, 4.8, 892),
('iTag Slim', 'Card-thin design fits perfectly in your wallet. Track your wallet with precision.', 34.99, NULL, '/products/itag-slim.png', 'essential', ARRAY['#1a1a1a', '#f5f5f7'], true, false, 4.6, 1456),
('iTag Pet', 'Designed for your furry friends. Lightweight, waterproof, and comfortable for pets.', 29.99, NULL, '/products/itag-pet.png', 'lifestyle', ARRAY['#ff6b6b', '#4ecdc4', '#ffe66d', '#1a1a1a'], true, false, 4.8, 3421),
('iTag 4-Pack', 'Best value bundle. Track multiple items with our most popular trackers.', 89.99, 119.99, '/products/itag-pack.png', 'bundle', ARRAY['#1a1a1a', '#f5f5f7'], true, true, 4.9, 5678);