-- 1. Remove direct order INSERT by authenticated users (orders must go through verify-payment edge function)
DROP POLICY IF EXISTS "Authenticated users can create their own orders" ON public.orders;

-- 2. Explicit restrictive policies on message_reply_events (service role only)
CREATE POLICY "Service role can insert message reply events"
  ON public.message_reply_events
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update message reply events"
  ON public.message_reply_events
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 3. Pin search_path on email queue functions and revoke from public roles
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- 4. Revoke EXECUTE from anon/authenticated on backend-only SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.reduce_stock(uuid, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_in_stock_from_quantity() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;

-- Keep public-callable functions accessible:
-- - check_email_exists, check_phone_exists: used by signup form validation
-- - has_role: used by RLS policies via SECURITY DEFINER context