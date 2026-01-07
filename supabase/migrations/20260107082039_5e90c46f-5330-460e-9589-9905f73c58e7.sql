-- Create a function to check if an email exists (returns boolean only, no data exposure)
CREATE OR REPLACE FUNCTION public.check_email_exists(check_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = lower(trim(check_email))
  );
END;
$$;

-- Create a function to check if a phone exists (returns boolean only, no data exposure)
CREATE OR REPLACE FUNCTION public.check_phone_exists(check_phone text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE phone = check_phone
  );
END;
$$;

-- Grant execute permissions to anonymous users
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_phone_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_phone_exists(text) TO authenticated;