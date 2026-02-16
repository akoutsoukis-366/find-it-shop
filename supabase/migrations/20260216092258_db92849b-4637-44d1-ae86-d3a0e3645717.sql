
-- Create categories table
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT USING (true);

-- Admin CRUD
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed existing categories
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Premium', 'premium', 1),
  ('Essential', 'essential', 2),
  ('Lifestyle', 'lifestyle', 3),
  ('Bundles', 'bundle', 4);
