-- Update the check_phone_exists function to normalize phone numbers (remove spaces)
CREATE OR REPLACE FUNCTION public.check_phone_exists(check_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_phone text;
BEGIN
  -- Normalize the input phone: remove all non-digit characters except leading +
  normalized_phone := regexp_replace(check_phone, '[^0-9+]', '', 'g');
  
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE regexp_replace(phone, '[^0-9+]', '', 'g') = normalized_phone
  );
END;
$$;