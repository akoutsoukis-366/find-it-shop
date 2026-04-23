-- Goal: keep direct public read of individual files in site-assets,
-- but block anonymous LIST/browse of the bucket contents.

-- 1) Bucket stays public so /object/public/<bucket>/<path> URLs work.
UPDATE storage.buckets SET public = true WHERE id = 'site-assets';

-- 2) Drop any prior policies we created for this bucket on storage.objects
DROP POLICY IF EXISTS "Anyone can view site assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can read individual site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can list site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage site assets" ON storage.objects;

-- 3) Allow only admins to LIST/SELECT object rows (which is what powers
--    the storage list API and "browse all files" behavior).
CREATE POLICY "Admins can list site assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'site-assets'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 4) Allow admins to upload / update / delete files in this bucket.
CREATE POLICY "Admins can manage site assets"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'site-assets'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'site-assets'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Note: Direct public reads via the /object/public/... endpoint do NOT
-- require a SELECT policy on storage.objects because the bucket is public.
-- Anonymous users can fetch a known file URL, but cannot enumerate files.