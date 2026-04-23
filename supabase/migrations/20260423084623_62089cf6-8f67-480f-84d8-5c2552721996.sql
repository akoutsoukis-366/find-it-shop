-- Re-enable public access on the site-assets bucket so product images load by direct URL.
-- The previous hardening attempt set this to false, which broke all public product images.
UPDATE storage.buckets SET public = true WHERE id = 'site-assets';