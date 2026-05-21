
CREATE TABLE public.message_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
  subject text NOT NULL,
  body text NOT NULL,
  recipient_email text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  resend_id text,
  error text,
  sent_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_replies_message_id ON public.message_replies(message_id);
CREATE INDEX idx_message_replies_resend_id ON public.message_replies(resend_id);

ALTER TABLE public.message_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view message replies"
ON public.message_replies FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert message replies"
ON public.message_replies FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_message_replies_updated_at
BEFORE UPDATE ON public.message_replies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.message_replies;
