import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/svix@1.21.0";

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

    // Verify Resend webhook signature (Svix headers) to prevent spoofed events
    const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
    const rawBody = await req.text();
    let payload: any;

    if (webhookSecret) {
      const svixId = req.headers.get("svix-id");
      const svixTimestamp = req.headers.get("svix-timestamp");
      const svixSignature = req.headers.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
        console.warn("[RESEND-WEBHOOK] Missing Svix signature headers");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      try {
        const wh = new Webhook(webhookSecret);
        payload = wh.verify(rawBody, {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        }) as any;
      } catch (verifyErr) {
        console.warn("[RESEND-WEBHOOK] Invalid signature");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    } else {
      console.warn("[RESEND-WEBHOOK] RESEND_WEBHOOK_SECRET not configured — refusing request");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 503,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

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

    // Log every event with raw payload for the admin history view
    await admin.from("message_reply_events").insert({
      reply_id: existing.id,
      event_type: type,
      status: newStatus,
      raw: payload,
    });

    const currentPriority = PRIORITY[existing.status] || 0;
    const newPriority = PRIORITY[newStatus] || 0;
    if (newPriority < currentPriority) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let errorMsg: string | null = null;
    if (newStatus === "bounced") {
      const bounceType: string = (payload?.data?.bounce?.type || "").toLowerCase();
      const bounceSubType: string = (payload?.data?.bounce?.subType || "").toLowerCase();
      if (bounceType === "hard" || bounceSubType === "general" || bounceSubType === "noemail" || bounceSubType === "suppressed") {
        errorMsg = "Η διεύθυνση email δεν υπάρχει ή δεν δέχεται μηνύματα. Ελέγξτε αν είναι σωστή.";
      } else if (bounceType === "soft") {
        errorMsg = "Προσωρινή αποτυχία παράδοσης (π.χ. γεμάτο γραμματοκιβώτιο ή μη διαθέσιμος server). Δοκιμάστε ξανά αργότερα.";
      } else {
        errorMsg = "Το email δεν παραδόθηκε. Πιθανώς η διεύθυνση είναι λάθος ή δεν δέχεται μηνύματα.";
      }
    } else if (newStatus === "complained") {
      errorMsg = "Ο παραλήπτης σήμανε το email ως spam.";
    }

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