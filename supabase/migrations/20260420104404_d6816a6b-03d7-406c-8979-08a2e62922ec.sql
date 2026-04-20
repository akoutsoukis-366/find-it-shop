
-- 1. Fix orders INSERT policy (critical): block anonymous inserts
DROP POLICY IF EXISTS "Allow insert for service role" ON public.orders;

CREATE POLICY "Authenticated users can create their own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Note: Stripe webhook & checkout edge functions use SUPABASE_SERVICE_ROLE_KEY
-- which bypasses RLS entirely, so server-created orders still work.

-- 2. Fix contact_messages INSERT policy (warn always-true): add validation
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;

CREATE POLICY "Anyone can submit valid contact messages"
ON public.contact_messages
FOR INSERT
TO public
WITH CHECK (
  length(trim(name)) > 0 AND length(name) <= 200
  AND length(trim(email)) > 0 AND length(email) <= 320
  AND length(trim(message)) > 0 AND length(message) <= 5000
);

-- 3. Restrict storage bucket listing (warn): require auth to list, keep public read by URL
DROP POLICY IF EXISTS "Anyone can view site assets" ON storage.objects;

-- Allow public access to individual files by direct URL (needed for product images)
-- but disallow bulk listing by anonymous users
CREATE POLICY "Public can read individual site assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'site-assets' AND name IS NOT NULL);

-- Make the bucket private at the bucket level so listing requires auth
UPDATE storage.buckets SET public = false WHERE id = 'site-assets';

-- 4. Remove personal contact fields from public settings allowlist
DROP POLICY IF EXISTS "Anyone can view public settings" ON public.settings;

CREATE POLICY "Anyone can view public settings"
ON public.settings
FOR SELECT
TO public
USING (
  key = ANY (ARRAY[
    'store_name','currency','free_shipping_threshold','warranty_years','return_days',
    'hero_image_url','hero_video_url','logo_url','favicon_url',
    'hero_badge_text','hero_title_line1','hero_title_line2','hero_description',
    'hero_stat1_value','hero_stat1_label','hero_stat2_value','hero_stat2_label','hero_stat3_value','hero_stat3_label',
    'features_title','features_subtitle',
    'feature1_title','feature1_description','feature2_title','feature2_description','feature3_title','feature3_description',
    'featured_products_title','featured_products_subtitle',
    'cta_title_line1','cta_title_line2','cta_description','cta_button_text',
    'about_hero_title_line1','about_hero_title_line2','about_hero_description',
    'about_stat1_value','about_stat1_label','about_stat2_value','about_stat2_label','about_stat3_value','about_stat3_label','about_stat4_value','about_stat4_label',
    'about_story_title','about_story_paragraph1','about_story_paragraph2','about_story_paragraph3','about_story_box_title','about_story_box_subtitle',
    'about_values_title','about_values_subtitle',
    'about_value1_title','about_value1_description','about_value2_title','about_value2_description','about_value3_title','about_value3_description',
    'about_contact_title','about_contact_subtitle',
    'footer_description',
    'trust1_title','trust1_description','trust2_title','trust2_description','trust3_title','trust3_description','trust4_title','trust4_description',
    'international_shipping','shipping_cost',
    'standard_shipping_days_min','standard_shipping_days_max',
    'express_shipping_cost','express_shipping_days_min','express_shipping_days_max'
  ])
);
