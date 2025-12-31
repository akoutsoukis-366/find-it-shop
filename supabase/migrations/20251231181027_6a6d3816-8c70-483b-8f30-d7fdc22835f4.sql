-- Create storage bucket for site assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true);

-- Allow anyone to view site assets (public bucket)
CREATE POLICY "Anyone can view site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

-- Only admins can upload site assets
CREATE POLICY "Admins can upload site assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update site assets
CREATE POLICY "Admins can update site assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete site assets
CREATE POLICY "Admins can delete site assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));

-- Update RLS policy to include image URL settings
DROP POLICY IF EXISTS "Anyone can view public settings" ON public.settings;

CREATE POLICY "Anyone can view public settings" 
ON public.settings 
FOR SELECT 
USING (key = ANY (ARRAY[
  -- Store info
  'store_name', 'contact_email', 'support_phone', 'currency', 'office_address',
  -- Shipping/Returns
  'free_shipping_threshold', 'warranty_years', 'return_days',
  -- Images
  'hero_image_url', 'logo_url', 'favicon_url',
  -- Homepage hero
  'hero_badge_text', 'hero_title_line1', 'hero_title_line2', 'hero_description',
  'hero_stat1_value', 'hero_stat1_label', 'hero_stat2_value', 'hero_stat2_label', 
  'hero_stat3_value', 'hero_stat3_label',
  -- Homepage features section
  'features_title', 'features_subtitle',
  'feature1_title', 'feature1_description',
  'feature2_title', 'feature2_description', 
  'feature3_title', 'feature3_description',
  -- Homepage featured products section
  'featured_products_title', 'featured_products_subtitle',
  -- Homepage CTA section
  'cta_title_line1', 'cta_title_line2', 'cta_description', 'cta_button_text',
  -- About page hero
  'about_hero_title_line1', 'about_hero_title_line2', 'about_hero_description',
  -- About page stats
  'about_stat1_value', 'about_stat1_label', 'about_stat2_value', 'about_stat2_label',
  'about_stat3_value', 'about_stat3_label', 'about_stat4_value', 'about_stat4_label',
  -- About page story
  'about_story_title', 'about_story_paragraph1', 'about_story_paragraph2', 'about_story_paragraph3',
  'about_story_box_title', 'about_story_box_subtitle',
  -- About page values
  'about_values_title', 'about_values_subtitle',
  'about_value1_title', 'about_value1_description',
  'about_value2_title', 'about_value2_description',
  'about_value3_title', 'about_value3_description',
  -- About page contact section
  'about_contact_title', 'about_contact_subtitle'
]::text[]));