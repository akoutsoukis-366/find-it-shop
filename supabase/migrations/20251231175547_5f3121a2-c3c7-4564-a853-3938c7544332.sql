-- Update the RLS policy to include new public settings
DROP POLICY IF EXISTS "Anyone can view public settings" ON public.settings;

CREATE POLICY "Anyone can view public settings" 
ON public.settings 
FOR SELECT 
USING (key = ANY (ARRAY[
  'store_name'::text, 
  'contact_email'::text, 
  'support_phone'::text, 
  'currency'::text, 
  'office_address'::text,
  'free_shipping_threshold'::text,
  'warranty_years'::text,
  'return_days'::text
]));