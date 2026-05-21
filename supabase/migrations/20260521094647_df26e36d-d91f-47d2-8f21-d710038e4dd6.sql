CREATE TABLE public.message_reply_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID NOT NULL REFERENCES public.message_replies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  status TEXT,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_reply_events_reply_id ON public.message_reply_events(reply_id, created_at DESC);

ALTER TABLE public.message_reply_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view message reply events"
ON public.message_reply_events
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));