-- Update public settings policy to include office_address
DROP POLICY IF EXISTS "Anyone can view public settings" ON public.settings;

CREATE POLICY "Anyone can view public settings"
ON public.settings
FOR SELECT
USING (key IN ('store_name', 'contact_email', 'support_phone', 'currency', 'office_address'));