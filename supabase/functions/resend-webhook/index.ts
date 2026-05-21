import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

// Maps Resend event types to message_replies.status values
const EVENT_STATUS: Record<string, string> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.delivery_delayed": "delayed",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.opened": "opened",
  "email.clicked": "clicked",
};

// Status priority: higher = more "final". Won't downgrade.
const PRIORITY: Record<string, number> = {
  sent: 1,
  delayed: 2,
  opened: 3,
  clicked: 4,
  delivered: 5,
  bounced: 6,
  complained: 6,
  failed: 6,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const payload = await req.json();
    const type: string = payload?.type || "";
    const emailId: string | undefined = payload?.data?.email_id || payload?.data?.id;
    const newStatus = EVENT_STATUS[type];

    if (!emailId || !newStatus) {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: existing } = await admin
      .from("message_replies")
      .select("id, status")
      .eq("resend_id", emailId)
      .maybeSingle();

    if (!existing) {
      return new Response(JSON.stringify({ ok: true, notFound: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const currentPriority = PRIORITY[existing.status] || 0;
    const newPriority = PRIORITY[newStatus] || 0;
    if (newPriority < currentPriority) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const errorMsg = newStatus === "bounced"
      ? payload?.data?.bounce?.message || "Bounced"
      : newStatus === "complained"
      ? "Complaint received"
      : null;

    await admin
      .from("message_replies")
      .update({ status: newStatus, error: errorMsg })
      .eq("id", existing.id);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("[RESEND-WEBHOOK] Error:", err?.message || err);
    return new Response(JSON.stringify({ error: "Webhook failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});