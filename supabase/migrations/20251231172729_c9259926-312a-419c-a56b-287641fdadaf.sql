-- Allow anyone to read public settings (contact info)
CREATE POLICY "Anyone can view public settings"
ON public.settings
FOR SELECT
USING (key IN ('store_name', 'contact_email', 'support_phone', 'currency'));