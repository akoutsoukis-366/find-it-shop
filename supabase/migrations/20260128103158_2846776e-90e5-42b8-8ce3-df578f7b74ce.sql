-- Update the RLS policy for public settings to include footer_description
DROP POLICY IF EXISTS "Anyone can view public settings" ON public.settings;

CREATE POLICY "Anyone can view public settings" 
ON public.settings 
FOR SELECT 
USING (key = ANY (ARRAY[
  'store_name'::text, 'contact_email'::text, 'support_phone'::text, 'currency'::text, 
  'office_address'::text, 'free_shipping_threshold'::text, 'warranty_years'::text, 'return_days'::text,
  'hero_image_url'::text, 'hero_video_url'::text, 'logo_url'::text, 'favicon_url'::text,
  'hero_badge_text'::text, 'hero_title_line1'::text, 'hero_title_line2'::text, 'hero_description'::text,
  'hero_stat1_value'::text, 'hero_stat1_label'::text, 'hero_stat2_value'::text, 'hero_stat2_label'::text,
  'hero_stat3_value'::text, 'hero_stat3_label'::text,
  'features_title'::text, 'features_subtitle'::text,
  'feature1_title'::text, 'feature1_description'::text,
  'feature2_title'::text, 'feature2_description'::text,
  'feature3_title'::text, 'feature3_description'::text,
  'featured_products_title'::text, 'featured_products_subtitle'::text,
  'cta_title_line1'::text, 'cta_title_line2'::text, 'cta_description'::text, 'cta_button_text'::text,
  'about_hero_title_line1'::text, 'about_hero_title_line2'::text, 'about_hero_description'::text,
  'about_stat1_value'::text, 'about_stat1_label'::text, 'about_stat2_value'::text, 'about_stat2_label'::text,
  'about_stat3_value'::text, 'about_stat3_label'::text, 'about_stat4_value'::text, 'about_stat4_label'::text,
  'about_story_title'::text, 'about_story_paragraph1'::text, 'about_story_paragraph2'::text, 'about_story_paragraph3'::text,
  'about_story_box_title'::text, 'about_story_box_subtitle'::text,
  'about_values_title'::text, 'about_values_subtitle'::text,
  'about_value1_title'::text, 'about_value1_description'::text,
  'about_value2_title'::text, 'about_value2_description'::text,
  'about_value3_title'::text, 'about_value3_description'::text,
  'about_contact_title'::text, 'about_contact_subtitle'::text,
  'footer_description'::text
]));